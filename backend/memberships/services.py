from django.db import transaction
from django.utils import timezone

from .models import MembershipPlan, Subscription


class SubscriptionError(Exception):
    """Raised when a subscription action cannot be completed."""

    def __init__(self, message: str, code: str = "subscription_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def get_active_subscription(user) -> Subscription | None:
    """Return the user's currently active subscription, if any."""

    return (
        Subscription.objects.filter(
            user=user,
            status=Subscription.Status.ACTIVE,
        )
        .order_by("-created_at")
        .first()
    )


def create_active_subscription(user, plan: MembershipPlan) -> Subscription:
    """Create and return a new active subscription for the given plan.

    Public so other apps (e.g. payments, after verifying a Razorpay
    payment) can activate a subscription once payment is confirmed.
    """

    expires_at = timezone.now() + timezone.timedelta(
        days=plan.duration_days
    )

    return Subscription.objects.create(
        user=user,
        plan=plan,
        status=Subscription.Status.ACTIVE,
        expires_at=expires_at,
    )


def subscribe_user_to_plan(user, plan_slug: str) -> Subscription:
    """Create a new active subscription for a user on a FREE plan (price = 0) only.

    Paid plans must go through the payments app's checkout flow instead.
    Raises SubscriptionError if the plan does not exist, is inactive,
    requires payment, or the user already has an active subscription.
    """

    plan = MembershipPlan.objects.filter(
        slug=plan_slug,
        is_active=True,
    ).first()

    if plan is None:
        raise SubscriptionError(
            "No active membership plan found with this slug.",
            code="plan_not_found",
        )

    if plan.price > 0:
        raise SubscriptionError(
            "This plan requires payment. Please use the checkout flow.",
            code="payment_required",
        )

    existing = get_active_subscription(user)

    if existing is not None:
        raise SubscriptionError(
            "You already have an active subscription. "
            "Use the upgrade or downgrade option instead.",
            code="already_subscribed",
        )

    return create_active_subscription(user, plan)


def change_user_plan(user, new_plan_slug: str) -> tuple[Subscription, str]:
    """Cancel the user's current active subscription and start a new one.

    Only valid for switching to a FREE plan directly. Switching to a paid
    plan must go through the payments app's checkout flow instead.

    Returns a tuple of (new_subscription, change_type) where change_type
    is one of "upgrade", "downgrade", or "same" based on price comparison.

    Raises SubscriptionError if there is no active subscription to change,
    the target plan does not exist, requires payment, or is the same as
    the current one.
    """

    current_subscription = get_active_subscription(user)

    if current_subscription is None:
        raise SubscriptionError(
            "You do not have an active subscription to change. "
            "Use the subscribe endpoint instead.",
            code="no_active_subscription",
        )

    new_plan = MembershipPlan.objects.filter(
        slug=new_plan_slug,
        is_active=True,
    ).first()

    if new_plan is None:
        raise SubscriptionError(
            "No active membership plan found with this slug.",
            code="plan_not_found",
        )

    if new_plan.pk == current_subscription.plan.pk:
        raise SubscriptionError(
            "You are already subscribed to this plan.",
            code="same_plan",
        )

    if new_plan.price > 0:
        raise SubscriptionError(
            "This plan requires payment. Please use the checkout flow.",
            code="payment_required",
        )

    change_type = (
        "downgrade"
        if new_plan.price < current_subscription.plan.price
        else "same"
    )

    with transaction.atomic():
        current_subscription.status = Subscription.Status.CANCELLED
        current_subscription.cancelled_at = timezone.now()
        current_subscription.save(
            update_fields=["status", "cancelled_at", "updated_at"]
        )

        new_subscription = create_active_subscription(user, new_plan)

    return new_subscription, change_type
