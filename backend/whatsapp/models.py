from common.models import TimeStampedModel
from django.db import models


class WhatsAppLog(TimeStampedModel):
    """Tracks a WhatsApp invitation 'send' triggered by the organizer.

    No WhatsApp Business API is used. The backend builds a wa.me deep
    link with a pre-filled message; the organizer's own WhatsApp app
    performs the actual send when they tap it. This log records that
    the organizer triggered the send action for a given guest.
    """

    class Status(models.TextChoices):
        LINK_GENERATED = "LINK_GENERATED", "Link Generated"
        MARKED_SENT = "MARKED_SENT", "Marked Sent"
        FAILED = "FAILED", "Failed"

    invitation = models.ForeignKey(
        "invitations.Invitation",
        on_delete=models.CASCADE,
        related_name="whatsapp_logs",
    )

    guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.CASCADE,
        related_name="whatsapp_logs",
    )

    wa_link = models.URLField(
        max_length=1000,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.LINK_GENERATED,
    )

    retry_count = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        db_table = "whatsapp_logs"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"WhatsApp log for {self.guest.name} ({self.status})"
