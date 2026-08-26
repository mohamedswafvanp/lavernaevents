import razorpay
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


def get_razorpay_client() -> razorpay.Client:
    """Return a configured Razorpay API client."""

    return razorpay.Client(
        auth=(
            config("RAZORPAY_KEY_ID"),
            config("RAZORPAY_KEY_SECRET"),
        )
    )


def create_payment_order(user, plan_slug: str) -> Payment:
    """Create a Razorpay order for the given plan and store a Payment record.

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

    amount_in_paise = int(plan.price * 100)

    client = get_razorpay_client()

    razorpay_order = client.order.create(
        {
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,
        }
    )

    payment = Payment.objects.create(
        user=user,
        plan=plan,
        razorpay_order_id=razorpay_order["id"],
        amount=plan.price,
        currency="INR",
        status=Payment.Status.CREATED,
    )

    return payment


def verify_and_activate_payment(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> Payment:
    """Verify a Razorpay payment signature and activate the subscription.

    Raises PaymentError if the payment record is not found, the signature
    is invalid, or the payment has already been processed.
    """

    payment = Payment.objects.filter(
        razorpay_order_id=razorpay_order_id
    ).first()

    if payment is None:
        raise PaymentError(
            "Payment record not found for this order.",
            code="payment_not_found",
        )

    if payment.status == Payment.Status.PAID:
        raise PaymentError(
            "This payment has already been processed.",
            code="already_paid",
        )

    client = get_razorpay_client()

    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }
        )

    except razorpay.errors.SignatureVerificationError:
        payment.status = Payment.Status.FAILED
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.save(
            update_fields=[
                "status",
                "razorpay_payment_id",
                "razorpay_signature",
                "updated_at",
            ]
        )

        raise PaymentError(
            "Payment signature verification failed.",
            code="signature_invalid",
        )

    with transaction.atomic():
        payment.status = Payment.Status.PAID
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.save(
            update_fields=[
                "status",
                "razorpay_payment_id",
                "razorpay_signature",
                "updated_at",
            ]
        )

        create_active_subscription(payment.user, payment.plan)

    return payment
