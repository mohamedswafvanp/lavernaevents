from rest_framework import serializers

from .models import WhatsAppLog


class WhatsAppLogSerializer(serializers.ModelSerializer):
    """Serializer for reading a WhatsApp send log, including the wa.me link."""

    guest_name = serializers.CharField(source="guest.name", read_only=True)

    class Meta:
        model = WhatsAppLog
        fields = (
            "id",
            "guest",
            "guest_name",
            "wa_link",
            "status",
            "retry_count",
            "created_at",
        )
        read_only_fields = fields
