from rest_framework import serializers

from .models import Payment


class CreateCheckoutSessionSerializer(serializers.Serializer):
    """Serializer for validating a checkout session creation request."""

    plan_slug = serializers.SlugField(required=True)


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for reading payment record details."""

    plan_name = serializers.CharField(
        source="plan.name",
        read_only=True,
    )

    class Meta:
        model = Payment
        fields = (
            "id",
            "plan_name",
            "stripe_checkout_session_id",
            "amount",
            "currency",
            "status",
            "created_at",
        )
        read_only_fields = fields
