from common.models import TimeStampedModel
from django.db import models


class InvitationTemplate(TimeStampedModel):
    """A reusable invitation design, managed centrally by admins.

    Access to a template is gated by the organizer's membership plan
    via `minimum_template_tier`, checked against the plan's
    `template_limit` in the service layer (not stored here).
    """

    name = models.CharField(
        max_length=150,
    )

    description = models.TextField(
        blank=True,
    )

    preview_image = models.ImageField(
        upload_to="invitations/templates/",
    )

    background_image = models.ImageField(
        upload_to="invitations/templates/backgrounds/",
        help_text="Base image used to render personalized invitations.",
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Inactive templates are hidden from organizers.",
    )

    display_order = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        db_table = "invitation_templates"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name


class Invitation(TimeStampedModel):
    """A personalized invitation generated for a specific guest."""

    class Status(models.TextChoices):
        GENERATED = "GENERATED", "Generated"
        FAILED = "FAILED", "Failed"

    event = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        related_name="invitations",
    )

    guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.CASCADE,
        related_name="invitations",
    )

    template = models.ForeignKey(
        InvitationTemplate,
        on_delete=models.PROTECT,
        related_name="invitations",
    )

    response_token = models.CharField(
        max_length=64,
        unique=True,
        help_text="Unique token used in the guest's secure response link.",
    )

    image_file = models.ImageField(
        upload_to="invitations/generated/images/",
        blank=True,
        null=True,
    )

    pdf_file = models.FileField(
        upload_to="invitations/generated/pdfs/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.GENERATED,
    )

    class Meta:
        db_table = "invitations"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["guest", "template"],
                name="unique_invitation_per_guest_template",
            )
        ]

    def __str__(self) -> str:
        return f"Invitation for {self.guest.name} ({self.event.name})"
