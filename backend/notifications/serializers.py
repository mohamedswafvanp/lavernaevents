from rest_framework import serializers

from .models import NotificationLog


class SendInvitationSerializer(serializers.Serializer):
    """Serializer for the confirmation popup's send request.

    guest_id: which guest to send to
    template_id: which invitation template the organizer picked
    channel: WHATSAPP, EMAIL, or SMS
    """

    guest_id = serializers.IntegerField(required=True)
    template_id = serializers.IntegerField(required=True)
    channel = serializers.ChoiceField(
        choices=["WHATSAPP", "EMAIL", "SMS"],
        required=True,
    )


class NotificationLogSerializer(serializers.ModelSerializer):
    """Serializer for reading a notification send log."""

    guest_name = serializers.CharField(source="guest.name", read_only=True)
    template_name = serializers.CharField(
        source="invitation.template.name", read_only=True
    )

    class Meta:
        model = NotificationLog
        fields = (
            "id",
            "guest",
            "guest_name",
            "template_name",
            "channel",
            "wa_link",
            "status",
            "failure_reason",
            "retry_count",
            "created_at",
        )
        read_only_fields = fields
