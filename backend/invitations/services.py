import io
import secrets

from django.core.files.base import ContentFile
from django.db import IntegrityError
from memberships.utils import LimitExceededError, check_template_limit
from PIL import Image, ImageDraw, ImageFont

from .models import Invitation, InvitationTemplate


class InvitationError(Exception):
    """Raised when an invitation action cannot be completed."""

    def __init__(self, message: str, code: str = "invitation_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def get_organizer_template_usage_count(organizer) -> int:
    """Return the number of distinct templates this organizer has already used.

    Counts distinct templates across all of the organizer's events, since
    the plan's template_limit restricts how many DIFFERENT templates an
    organizer may use, not how many invitations are generated.
    """

    return (
        InvitationTemplate.objects.filter(
            invitations__event__organizer=organizer
        )
        .distinct()
        .count()
    )


def generate_response_token() -> str:
    """Generate a URL-safe, hard-to-guess token for the guest response link."""

    return secrets.token_urlsafe(24)


def _render_invitation_image(template: InvitationTemplate, event, guest) -> ContentFile:
    """Render a personalized invitation image by overlaying event/guest text
    onto the template's background image using Pillow.

    Text position is intentionally simple and fixed. A visual template
    editor (drag-and-drop text placement) is a frontend/admin concern,
    not part of this backend rendering step.
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


def generate_invitation(event, guest, template_slug_or_id, organizer) -> Invitation:
    """Generate a personalized invitation image for a guest using a template.

    Raises InvitationError if the template does not exist, is inactive,
    the organizer's plan does not allow another distinct template, or an
    invitation for this guest+template already exists.
    """

    template = InvitationTemplate.objects.filter(
        pk=template_slug_or_id,
        is_active=True,
    ).first()

    if template is None:
        raise InvitationError(
            "No active invitation template found with this ID.",
            code="template_not_found",
        )

    already_used = InvitationTemplate.objects.filter(
        pk=template.pk,
        invitations__event__organizer=organizer,
    ).exists()

    if not already_used:
        current_count = get_organizer_template_usage_count(organizer)

        try:
            check_template_limit(organizer, current_count)

        except LimitExceededError as error:
            raise InvitationError(error.message, code=error.code)

    try:
        invitation = Invitation.objects.create(
            event=event,
            guest=guest,
            template=template,
            response_token=generate_response_token(),
        )

    except IntegrityError:
        raise InvitationError(
            "An invitation using this template has already been generated for this guest.",
            code="duplicate_invitation",
        )

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
