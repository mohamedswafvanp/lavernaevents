import stripe
from decouple import config
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CreateCheckoutSessionSerializer, PaymentSerializer
from .services import (
    PaymentError,
    create_checkout_session,
    get_payment_status,
    handle_checkout_completed,
)

PAYMENT_ERROR_STATUS_MAP = {
    "plan_not_found": status.HTTP_404_NOT_FOUND,
    "payment_not_found": status.HTTP_404_NOT_FOUND,
}


class CreateCheckoutSessionView(APIView):
    """Create a Stripe Checkout Session for purchasing a membership plan."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Create a Checkout Session and return the redirect URL for the frontend."""

        serializer = CreateCheckoutSessionSerializer(data=request.data)

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

        frontend_url = config(
            "FRONTEND_URL",
            default="http://localhost:5173",
        )

        success_url = f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/payment/cancelled"

        try:
            payment, checkout_url = create_checkout_session(
                user=request.user,
                plan_slug=plan_slug,
                success_url=success_url,
                cancel_url=cancel_url,
            )

        except PaymentError as error:
            response_status = PAYMENT_ERROR_STATUS_MAP.get(
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
                "message": "Checkout session created successfully.",
                "data": {
                    "checkout_url": checkout_url,
                    "stripe_checkout_session_id": payment.stripe_checkout_session_id,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class PaymentStatusView(APIView):
    """Check the status of a payment after returning from Stripe Checkout."""

    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        """Return the current status of the payment for this checkout session."""

        try:
            payment = get_payment_status(session_id, request.user)

        except PaymentError as error:
            response_status = PAYMENT_ERROR_STATUS_MAP.get(
                error.code,
                status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {
                    "success": False,
                    "message": error.message,
                    "errors": {"session": [error.message]},
                },
                status=response_status,
            )

        serializer = PaymentSerializer(payment)

        return Response(
            {
                "success": True,
                "message": "Payment status retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class StripeWebhookView(APIView):
    """Receive and verify Stripe webhook events (checkout.session.completed).

    This is the TRUSTED confirmation path for payment success -- the
    frontend redirect after checkout is only used to show a "processing"
    screen, never to activate a subscription directly.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """Verify the webhook signature and process the event."""

        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        webhook_secret = config("STRIPE_WEBHOOK_SECRET")

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )

        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(
                {"success": False, "message": "Invalid webhook signature."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if event["type"] == "checkout.session.completed":
            session_data = event["data"]["object"]

            try:
                handle_checkout_completed(session_data)

            except PaymentError:
                pass

        return Response({"success": True}, status=status.HTTP_200_OK)
