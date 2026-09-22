import stripe
from decouple import config
from django.db import transaction
from memberships.models import MembershipPlan
from memberships.services import create_active_subscription

from .models import Payment


class PaymentError(Exception):
    """Raised when a payment action cannot be completed."""

    def __init__(self, message: str, code: str = "payment_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def _configure_stripe() -> None:
    """Set the Stripe API key from environment configuration."""

    stripe.api_key = config("STRIPE_SECRET_KEY")


def create_checkout_session(user, plan_slug: str, success_url: str, cancel_url: str) -> Payment:
    """Create a Stripe Checkout Session for purchasing a membership plan.

    Raises PaymentError if the plan does not exist or is inactive.
    """

    plan = MembershipPlan.objects.filter(
        slug=plan_slug,
        is_active=True,
    ).first()

    if plan is None:
        raise PaymentError(
            "No active membership plan found with this slug.",
            code="plan_not_found",
        )

    _configure_stripe()

    amount_in_smallest_unit = int(plan.price * 100)

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "inr",
                    "product_data": {"name": f"LavernaEvents - {plan.name} Plan"},
                    "unit_amount": amount_in_smallest_unit,
                },
                "quantity": 1,
            }
        ],
        success_url=success_url,
        cancel_url=cancel_url,
        client_reference_id=str(user.pk),
        metadata={"user_id": user.pk, "plan_slug": plan.slug},
    )

    payment = Payment.objects.create(
        user=user,
        plan=plan,
        stripe_checkout_session_id=session.id,
        amount=plan.price,
        currency="INR",
        status=Payment.Status.CREATED,
    )

    return payment, session.url


def handle_checkout_completed(session_data: dict) -> Payment:
    """Process a Stripe checkout.session.completed webhook event.

    Raises PaymentError if the payment record is not found or has
    already been processed. Called from the webhook view, never
    directly from the frontend, since this is the trusted server-to-
    server confirmation that payment actually succeeded.
    """

    checkout_session_id = session_data.get("id")

    payment = Payment.objects.filter(
        stripe_checkout_session_id=checkout_session_id
    ).first()

    if payment is None:
        raise PaymentError(
            "Payment record not found for this checkout session.",
            code="payment_not_found",
        )

    if payment.status == Payment.Status.PAID:
        return payment

    with transaction.atomic():
        payment.status = Payment.Status.PAID
        payment.stripe_payment_intent_id = session_data.get("payment_intent", "")
        payment.save(
            update_fields=[
                "status",
                "stripe_payment_intent_id",
                "updated_at",
            ]
        )

        create_active_subscription(payment.user, payment.plan)

    return payment


def get_payment_status(checkout_session_id: str, user) -> Payment:
    """Return the payment record for a checkout session, scoped to the requesting user.

    Used by the frontend to poll/confirm payment status after redirect
    back from Stripe Checkout, since the actual activation happens via
    webhook, not the redirect itself.
    """

    payment = Payment.objects.filter(
        stripe_checkout_session_id=checkout_session_id,
        user=user,
    ).first()

    if payment is None:
        raise PaymentError(
            "Payment record not found.",
            code="payment_not_found",
        )

    return payment
