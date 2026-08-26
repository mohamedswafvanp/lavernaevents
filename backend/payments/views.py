from decouple import config
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    CreateOrderSerializer,
    PaymentSerializer,
    VerifyPaymentSerializer,
)
from .services import (
    PaymentError,
    create_payment_order,
    verify_and_activate_payment,
)


class CreatePaymentOrderView(APIView):
    """Create a Razorpay order for purchasing a membership plan."""

    permission_classes = [IsAuthenticated]

    ERROR_STATUS_MAP = {
        "plan_not_found": status.HTTP_404_NOT_FOUND,
    }

    def post(self, request):
        """Create a Razorpay order and return checkout details for the frontend."""

        serializer = CreateOrderSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        plan_slug = serializer.validated_data["plan_slug"]

        try:
            payment = create_payment_order(
                user=request.user,
                plan_slug=plan_slug,
            )

        except PaymentError as error:
            response_status = self.ERROR_STATUS_MAP.get(
                error.code,
                status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {
                    "success": False,
                    "message": error.message,
                    "errors": {"plan_slug": [error.message]},
                },
                status=response_status,
            )

        return Response(
            {
                "success": True,
                "message": "Payment order created successfully.",
                "data": {
                    "razorpay_order_id": payment.razorpay_order_id,
                    "razorpay_key_id": config("RAZORPAY_KEY_ID"),
                    "amount": str(payment.amount),
                    "currency": payment.currency,
                    "plan_slug": plan_slug,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(APIView):
    """Verify a completed Razorpay payment and activate the subscription."""

    permission_classes = [IsAuthenticated]

    ERROR_STATUS_MAP = {
        "payment_not_found": status.HTTP_404_NOT_FOUND,
        "already_paid": status.HTTP_409_CONFLICT,
        "signature_invalid": status.HTTP_400_BAD_REQUEST,
    }

    def post(self, request):
        """Validate the payment signature and activate the user's subscription."""

        serializer = VerifyPaymentSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = verify_and_activate_payment(
                razorpay_order_id=serializer.validated_data["razorpay_order_id"],
                razorpay_payment_id=serializer.validated_data["razorpay_payment_id"],
                razorpay_signature=serializer.validated_data["razorpay_signature"],
            )

        except PaymentError as error:
            response_status = self.ERROR_STATUS_MAP.get(
                error.code,
                status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {
                    "success": False,
                    "message": error.message,
                    "errors": {"payment": [error.message]},
                },
                status=response_status,
            )

        response_serializer = PaymentSerializer(payment)

        return Response(
            {
                "success": True,
                "message": "Payment verified and subscription activated successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_200_OK,
        )
