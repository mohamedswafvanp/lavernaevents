import requests
from decouple import config
from django.core.mail import EmailMessage
from invitations.services import InvitationError, get_or_create_invitation

from .models import NotificationLog


class NotificationError(Exception):
    """Raised when a notification send action cannot be completed."""

    def __init__(self, message: str, code: str = "notification_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def build_response_link(response_token: str) -> str:
    """Build the guest-facing secure response link for Accept/Reject/Maybe."""

    frontend_url = config(
        "FRONTEND_GUEST_RESPONSE_URL",
        default="http://localhost:5173/respond",
    )

    return f"{frontend_url}/{response_token}"


def build_invitation_text(event, guest, response_link: str) -> str:
    """Build the plain-text invitation message shared across channels."""

    return (
        f"Hello {guest.name},\n\n"
        f"You are invited to {event.name}!\n\n"
        f"Date: {event.event_date.strftime('%d %B %Y')}\n"
        f"Time: {event.event_time.strftime('%I:%M %p')}\n"
        f"Venue: {event.venue_name}\n"
        + (f"Location: {event.google_maps_link}\n" if event.google_maps_link else "")
        + f"\nPlease confirm your attendance here:\n{response_link}"
    )


def _send_via_whatsapp(invitation, message: str) -> NotificationLog:
    """Build a wa.me deep link (no WhatsApp Business API needed).

    Status stays LINK_GENERATED until the organizer confirms they sent
    it via the separate mark-sent endpoint, since there is no delivery
    webhook available without the paid Business API.
    """

    from urllib.parse import quote

    mobile_number = invitation.guest.mobile_number.lstrip("0")

    country_code = config("DEFAULT_COUNTRY_CODE", default="91")

    if not mobile_number.startswith(country_code):
        mobile_number = f"{country_code}{mobile_number}"

    wa_link = f"https://wa.me/{mobile_number}?text={quote(message)}"

    return NotificationLog.objects.create(
        invitation=invitation,
        guest=invitation.guest,
        channel=NotificationLog.Channel.WHATSAPP,
        wa_link=wa_link,
        status=NotificationLog.Status.LINK_GENERATED,
    )


def _send_via_email(invitation, message: str) -> NotificationLog:
    """Send the invitation directly via email using Django's email backend."""

    guest = invitation.guest

    if not guest.email:
        raise NotificationError(
            "This guest has no email address on file.",
            code="missing_email",
        )

    log = NotificationLog.objects.create(
        invitation=invitation,
        guest=guest,
        channel=NotificationLog.Channel.EMAIL,
        status=NotificationLog.Status.LINK_GENERATED,
    )

    try:
        email = EmailMessage(
            subject=f"You're invited to {invitation.event.name}!",
            body=message,
            to=[guest.email],
        )

        if invitation.image_file:
            email.attach_file(invitation.image_file.path)

        email.send(fail_silently=False)

    except Exception as exc:
        log.status = NotificationLog.Status.FAILED
        log.failure_reason = str(exc)[:255]
        log.save(update_fields=["status", "failure_reason", "updated_at"])

        raise NotificationError(
            "Failed to send email. Please try again.",
            code="email_send_failed",
        )

    log.status = NotificationLog.Status.SENT
    log.save(update_fields=["status", "updated_at"])

    return log


def _send_via_sms(invitation, message: str) -> NotificationLog:
    """Send the invitation via SMS using the Fast2sms API.

    Fast2sms's Quick SMS route has a message length limit and does not
    support attachments, so the SMS contains a short version pointing
    the guest to the response link rather than the full invitation text.
    """

    guest = invitation.guest

    log = NotificationLog.objects.create(
        invitation=invitation,
        guest=guest,
        channel=NotificationLog.Channel.SMS,
        status=NotificationLog.Status.LINK_GENERATED,
    )

    short_message = (
        f"You're invited to {invitation.event.name}! "
        f"Confirm attendance: {message.splitlines()[-1]}"
    )[:160]

    api_key = config("FAST2SMS_API_KEY")

    try:
        response = requests.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={"authorization": api_key},
            data={
                "route": "q",
                "message": short_message,
                "language": "english",
                "flash": 0,
                "numbers": guest.mobile_number,
            },
            timeout=10,
        )

        response_data = response.json()

        if not response_data.get("return"):
            raise NotificationError(
                response_data.get("message", ["SMS send failed."])[0],
                code="sms_send_failed",
            )

    except (requests.RequestException, ValueError, NotificationError) as exc:
        log.status = NotificationLog.Status.FAILED
        log.failure_reason = str(exc)[:255]
        log.save(update_fields=["status", "failure_reason", "updated_at"])

        raise NotificationError(
            "Failed to send SMS. Please try again.",
            code="sms_send_failed",
        )

    log.status = NotificationLog.Status.SENT
    log.save(update_fields=["status", "updated_at"])

    return log


CHANNEL_HANDLERS = {
    "WHATSAPP": _send_via_whatsapp,
    "EMAIL": _send_via_email,
    "SMS": _send_via_sms,
}


def send_invitation(event, guest, template_id, channel, organizer) -> NotificationLog:
    """The unified send action backing the organizer's confirmation popup.

    Generates (or reuses) the invitation for the chosen template, then
    dispatches it through the chosen channel. This is the single entry
    point the 'Send' button + popup should call.

    Raises InvitationError (template issues) or NotificationError
    (channel/delivery issues).
    """

    if channel not in CHANNEL_HANDLERS:
        raise NotificationError(
            "Channel must be one of: WHATSAPP, EMAIL, SMS.",
            code="invalid_channel",
        )

    invitation = get_or_create_invitation(
        event=event,
        guest=guest,
        template_id=template_id,
        organizer=organizer,
    )

    response_link = build_response_link(invitation.response_token)
    message = build_invitation_text(event, guest, response_link)

    handler = CHANNEL_HANDLERS[channel]
    log = handler(invitation, message)

    if log.status == NotificationLog.Status.SENT:
        guest.invitation_status = guest.InvitationStatus.SENT
        guest.save(update_fields=["invitation_status", "updated_at"])

    return log


def mark_whatsapp_as_sent(log: NotificationLog) -> NotificationLog:
    """Mark a WhatsApp log as sent after the organizer confirms (no delivery webhook)."""

    log.status = NotificationLog.Status.SENT
    log.save(update_fields=["status", "updated_at"])

    guest = log.guest
    guest.invitation_status = guest.InvitationStatus.SENT
    guest.save(update_fields=["invitation_status", "updated_at"])

    return log


def retry_notification(log: NotificationLog) -> NotificationLog:
    """Retry a failed or unconfirmed send by re-running the same channel handler."""

    handler = CHANNEL_HANDLERS.get(log.channel)

    if handler is None:
        raise NotificationError(
            "Unknown channel, cannot retry.",
            code="invalid_channel",
        )

    response_link = build_response_link(log.invitation.response_token)
    message = build_invitation_text(log.invitation.event, log.guest, response_link)

    log.retry_count += 1
    log.save(update_fields=["retry_count", "updated_at"])

    return handler(log.invitation, message)
