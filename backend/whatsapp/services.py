from urllib.parse import quote

from decouple import config

from .models import WhatsAppLog


class WhatsAppError(Exception):
    """Raised when a WhatsApp send action cannot be completed."""

    def __init__(self, message: str, code: str = "whatsapp_error"):
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


def build_invitation_message(event, guest, response_link: str) -> str:
    """Build the WhatsApp message text sent along with the invitation."""

    return (
        f"Hello {guest.name},\n\n"
        f"You are invited to {event.name}!\n\n"
        f"Date: {event.event_date.strftime('%d %B %Y')}\n"
        f"Time: {event.event_time.strftime('%I:%M %p')}\n"
        f"Venue: {event.venue_name}\n"
        + (f"Location: {event.google_maps_link}\n" if event.google_maps_link else "")
        + f"\nPlease confirm your attendance here:\n{response_link}"
    )


def build_wa_link(guest, message: str) -> str:
    """Build a wa.me deep link that pre-fills the message for this guest.

    No WhatsApp Business API is used. Opening this link (in the browser
    or app) opens WhatsApp with the guest's number and message
    pre-filled; the organizer's own WhatsApp then performs the send.
    """

    mobile_number = guest.mobile_number.lstrip("0")

    country_code = config("DEFAULT_COUNTRY_CODE", default="91")

    if not mobile_number.startswith(country_code):
        mobile_number = f"{country_code}{mobile_number}"

    encoded_message = quote(message)

    return f"https://wa.me/{mobile_number}?text={encoded_message}"


def create_whatsapp_send(invitation) -> WhatsAppLog:
    """Build the wa.me link for an invitation and log the send attempt.

    Raises WhatsAppError if the invitation has no generated image
    (image is meant to be attached manually by the organizer via
    WhatsApp, since wa.me links cannot pre-attach media).
    """

    if not invitation.image_file:
        raise WhatsAppError(
            "This invitation has no generated image yet. "
            "Please generate the invitation first.",
            code="no_image",
        )

    response_link = build_response_link(invitation.response_token)

    message = build_invitation_message(
        invitation.event,
        invitation.guest,
        response_link,
    )

    wa_link = build_wa_link(invitation.guest, message)

    log = WhatsAppLog.objects.create(
        invitation=invitation,
        guest=invitation.guest,
        wa_link=wa_link,
        status=WhatsAppLog.Status.LINK_GENERATED,
    )

    return log


def mark_as_sent(log: WhatsAppLog) -> WhatsAppLog:
    """Mark a WhatsApp log as sent, updating the guest's invitation_status.

    Called after the organizer confirms they tapped send in WhatsApp,
    since there is no delivery webhook available without the Business API.
    """

    log.status = WhatsAppLog.Status.MARKED_SENT
    log.save(update_fields=["status", "updated_at"])

    guest = log.guest
    guest.invitation_status = guest.InvitationStatus.SENT
    guest.save(update_fields=["invitation_status", "updated_at"])

    return log


def retry_send(log: WhatsAppLog) -> WhatsAppLog:
    """Increment the retry count and reset status for a re-send attempt."""

    log.retry_count += 1
    log.status = WhatsAppLog.Status.LINK_GENERATED
    log.save(update_fields=["retry_count", "status", "updated_at"])

    return log
