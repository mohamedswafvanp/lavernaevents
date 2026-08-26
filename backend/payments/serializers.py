from rest_framework import serializers

from .models import Payment


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for validating a payment order creation request."""

    plan_slug = serializers.SlugField(required=True)


class VerifyPaymentSerializer(serializers.Serializer):
    """Serializer for validating a Razorpay payment verification callback."""

    razorpay_order_id = serializers.CharField(required=True)

    razorpay_payment_id = serializers.CharField(required=True)

    razorpay_signature = serializers.CharField(required=True)


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
            "razorpay_order_id",
            "amount",
            "currency",
            "status",
            "created_at",
        )
        read_only_fields = fields
