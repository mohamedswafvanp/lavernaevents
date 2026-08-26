from common.models import TimeStampedModel
from django.db import models


class Guest(TimeStampedModel):
    """A guest invited to a specific event."""

    class InvitationStatus(models.TextChoices):
        NOT_SENT = "NOT_SENT", "Not Sent"
        SENT = "SENT", "Sent"
        FAILED = "FAILED", "Failed"

    class ResponseStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        MAYBE = "MAYBE", "Maybe"

    event = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        related_name="guests",
    )

    name = models.CharField(
        max_length=150,
    )

    mobile_number = models.CharField(
        max_length=20,
    )

    family_member_count = models.PositiveIntegerField(
        default=3,
        help_text="Used for expected attendance calculation.",
    )

    invitation_status = models.CharField(
        max_length=20,
        choices=InvitationStatus.choices,
        default=InvitationStatus.NOT_SENT,
    )

    response_status = models.CharField(
        max_length=20,
        choices=ResponseStatus.choices,
        default=ResponseStatus.PENDING,
    )

    notes = models.CharField(
        max_length=255,
        blank=True,
    )

    class Meta:
        db_table = "guests"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["event", "mobile_number"],
                name="unique_guest_per_event",
            )
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.event.name})"
