import io
import secrets

from django.core.files.base import ContentFile
from django.db import IntegrityError
from memberships.utils import LimitExceededError, check_template_access
from PIL import Image, ImageDraw, ImageFont

from .models import Invitation, InvitationTemplate


class InvitationError(Exception):
    """Raised when an invitation action cannot be completed."""

    def __init__(self, message: str, code: str = "invitation_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def generate_response_token() -> str:
    """Generate a URL-safe, hard-to-guess token for the guest response link."""

    return secrets.token_urlsafe(24)


def _render_invitation_image(template: InvitationTemplate, event, guest) -> ContentFile:
    """Render a personalized invitation image by overlaying event/guest text
    onto the template's background image using Pillow.
    """

    background = Image.open(template.background_image.path).convert("RGB")

    draw = ImageDraw.Draw(background)

    try:
        font_large = ImageFont.truetype("DejaVuSans-Bold.ttf", 48)
        font_small = ImageFont.truetype("DejaVuSans.ttf", 32)

    except OSError:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    width, height = background.size

    lines = [
        (event.name, font_large),
        (f"Dear {guest.name},", font_small),
        (f"Date: {event.event_date.strftime('%d %B %Y')}", font_small),
        (f"Time: {event.event_time.strftime('%I:%M %p')}", font_small),
        (f"Venue: {event.venue_name}", font_small),
    ]

    y = int(height * 0.55)

    for text, font in lines:
        text_width = draw.textlength(text, font=font)
        x = (width - text_width) / 2
        draw.text((x, y), text, fill="black", font=font)
        y += 50

    buffer = io.BytesIO()
    background.save(buffer, format="JPEG", quality=90)
    buffer.seek(0)

    return ContentFile(buffer.read())


def get_or_create_invitation(event, guest, template_id, organizer) -> Invitation:
    """Get the existing invitation for this guest+template, or generate a new one.

    Called at SEND TIME -- the organizer picks the template in the send
    confirmation popup, and the invitation (including its image) is
    generated on the spot if it doesn't already exist yet. If the guest
    was already sent an invitation using this same template before
    (e.g. a retry), the existing one is reused rather than duplicated.

    Raises InvitationError if the template does not exist, is inactive,
    or the organizer's plan does not include it.
    """

    template = InvitationTemplate.objects.filter(
        pk=template_id,
        is_active=True,
    ).first()

    if template is None:
        raise InvitationError(
            "No active invitation template found with this ID.",
            code="template_not_found",
        )

    try:
        check_template_access(organizer, template)

    except LimitExceededError as error:
        raise InvitationError(error.message, code=error.code)

    existing = Invitation.objects.filter(guest=guest, template=template).first()

    if existing is not None:
        return existing

    try:
        invitation = Invitation.objects.create(
            event=event,
            guest=guest,
            template=template,
            response_token=generate_response_token(),
        )

    except IntegrityError:
        invitation = Invitation.objects.get(guest=guest, template=template)
        return invitation

    try:
        image_content = _render_invitation_image(template, event, guest)
        invitation.image_file.save(
            f"invitation_{invitation.pk}.jpg",
            image_content,
            save=True,
        )

    except Exception:
        invitation.status = Invitation.Status.FAILED
        invitation.save(update_fields=["status", "updated_at"])

        raise InvitationError(
            "Invitation record created, but image rendering failed. "
            "Please contact support.",
            code="render_failed",
        )

    return invitation
