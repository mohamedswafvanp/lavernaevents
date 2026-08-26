from rest_framework import serializers

from .models import Invitation, InvitationTemplate


class InvitationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for listing invitation templates available to organizers."""

    class Meta:
        model = InvitationTemplate
        fields = (
            "id",
            "name",
            "description",
            "preview_image",
            "display_order",
        )
        read_only_fields = fields


class GenerateInvitationSerializer(serializers.Serializer):
    """Serializer for validating an invitation generation request."""

    guest_id = serializers.IntegerField(required=True)
    template_id = serializers.IntegerField(required=True)


class InvitationSerializer(serializers.ModelSerializer):
    """Serializer for reading a generated invitation's details."""

    guest_name = serializers.CharField(source="guest.name", read_only=True)
    template_name = serializers.CharField(source="template.name", read_only=True)

    class Meta:
        model = Invitation
        fields = (
            "id",
            "guest",
            "guest_name",
            "template",
            "template_name",
            "response_token",
            "image_file",
            "pdf_file",
            "status",
            "created_at",
        )
        read_only_fields = fields
