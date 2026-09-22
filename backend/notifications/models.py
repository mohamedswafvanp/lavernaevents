from common.models import TimeStampedModel
from django.db import models


class NotificationLog(TimeStampedModel):
    """Tracks an invitation send attempt through any channel.

    Replaces the earlier WhatsApp-only log with a channel-agnostic one,
    since the organizer now picks WhatsApp, Email, or SMS per guest at
    send time via the confirmation popup.
    """

    class Channel(models.TextChoices):
        WHATSAPP = "WHATSAPP", "WhatsApp"
        EMAIL = "EMAIL", "Email"
        SMS = "SMS", "SMS"

    class Status(models.TextChoices):
        LINK_GENERATED = "LINK_GENERATED", "Link Generated"
        SENT = "SENT", "Sent"
        FAILED = "FAILED", "Failed"

    invitation = models.ForeignKey(
        "invitations.Invitation",
        on_delete=models.CASCADE,
        related_name="notification_logs",
    )

    guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.CASCADE,
        related_name="notification_logs",
    )

    channel = models.CharField(
        max_length=20,
        choices=Channel.choices,
    )

    wa_link = models.URLField(
        max_length=1000,
        blank=True,
        help_text="Populated only for the WhatsApp channel.",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.LINK_GENERATED,
    )

    failure_reason = models.CharField(
        max_length=255,
        blank=True,
    )

    retry_count = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        db_table = "notification_logs"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.channel} to {self.guest.name} ({self.status})"
