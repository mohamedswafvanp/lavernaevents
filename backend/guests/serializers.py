from rest_framework import serializers

from .models import Guest


class GuestSerializer(serializers.ModelSerializer):
    """Serializer for creating, updating, and reading guests."""

    class Meta:
        model = Guest
        fields = (
            "id",
            "name",
            "mobile_number",
            "family_member_count",
            "invitation_status",
            "response_status",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "invitation_status",
            "response_status",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value: str) -> str:
        """Validate and normalize the guest's name."""

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Guest name is required."
            )

        return value

    def validate_mobile_number(self, value: str) -> str:
        """Validate and normalize the guest's mobile number."""

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Mobile number is required."
            )

        if not value.isdigit():
            raise serializers.ValidationError(
                "Mobile number must contain only digits."
            )

        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Mobile number must contain between 10 and 15 digits."
            )

        return value

    def validate_family_member_count(self, value: int) -> int:
        """Ensure family member count is a sane, non-negative number."""

        if value < 0:
            raise serializers.ValidationError(
                "Family member count cannot be negative."
            )

        if value > 50:
            raise serializers.ValidationError(
                "Family member count seems unusually high. Please double check."
            )

        return value


class CSVImportResultSerializer(serializers.Serializer):
    """Serializer for reporting the result of a CSV guest import."""

    created_count = serializers.IntegerField()
    skipped_count = serializers.IntegerField()
    skipped_rows = serializers.ListField(
        child=serializers.DictField()
    )
