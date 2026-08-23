from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for creating a new LavernaEvents user."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={"input_type": "password"},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = (
            "full_name",
            "email",
            "mobile_number",
            "password",
            "password_confirm",
        )

    def validate_full_name(self, value: str) -> str:
        """Validate and normalize the user's full name."""

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Full name is required."
            )

        return value

    def validate_email(self, value: str) -> str:
        """Validate and normalize email address."""

        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_mobile_number(self, value: str) -> str:
        """Validate and normalize mobile number."""

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

        if User.objects.filter(
            mobile_number=value
        ).exists():
            raise serializers.ValidationError(
                "A user with this mobile number already exists."
            )

        return value

    def validate_password(self, value: str) -> str:
        """Validate password using Django's password validators."""

        validate_password(value)

        return value

    def validate(self, attrs: dict) -> dict:
        """Validate password confirmation."""

        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm": (
                        "Passwords do not match."
                    )
                }
            )

        return attrs

    def create(self, validated_data: dict) -> User:
        """Create a user using the custom user manager."""

        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        return user
