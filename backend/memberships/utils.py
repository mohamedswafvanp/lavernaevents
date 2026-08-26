from .models import MembershipPlan
from .services import get_active_subscription


class LimitExceededError(Exception):
    """Raised when an action would exceed the user's plan limit."""

    def __init__(self, message: str, code: str = "limit_exceeded"):
        self.message = message
        self.code = code
        super().__init__(message)


def get_effective_plan(user) -> MembershipPlan | None:
    """Return the plan tied to the user's active subscription, or None.

    Modules calling this should treat a None return as "no active plan"
    and decide their own fallback (e.g. block the action, or apply a
    strict default limit).
    """

    subscription = get_active_subscription(user)

    if subscription is None:
        return None

    return subscription.plan


def check_guest_limit(user, current_guest_count: int) -> None:
    """Raise LimitExceededError if adding one more guest would exceed the plan.

    current_guest_count should be the guest count BEFORE adding the new guest.
    """

    plan = get_effective_plan(user)

    if plan is None:
        raise LimitExceededError(
            "An active membership plan is required to add guests.",
            code="no_active_plan",
        )

    if current_guest_count >= plan.guest_limit:
        raise LimitExceededError(
            f"Guest limit reached. Your {plan.name} plan allows up to "
            f"{plan.guest_limit} guests.",
            code="guest_limit_exceeded",
        )


def check_event_limit(user, current_event_count: int) -> None:
    """Raise LimitExceededError if creating one more event would exceed the plan."""

    plan = get_effective_plan(user)

    if plan is None:
        raise LimitExceededError(
            "An active membership plan is required to create events.",
            code="no_active_plan",
        )

    if current_event_count >= plan.event_limit:
        raise LimitExceededError(
            f"Event limit reached. Your {plan.name} plan allows up to "
            f"{plan.event_limit} events.",
            code="event_limit_exceeded",
        )


def check_template_access(user, template) -> None:
    """Raise LimitExceededError if the plan does not include this specific template.

    Templates are assigned to plans individually by the admin (a
    many-to-many relationship), not counted against a numeric limit.
    """

    plan = get_effective_plan(user)

    if plan is None:
        raise LimitExceededError(
            "An active membership plan is required to use invitation templates.",
            code="no_active_plan",
        )

    if not plan.templates.filter(pk=template.pk).exists():
        raise LimitExceededError(
            f"This template is not available on your {plan.name} plan. "
            "Please choose another template or upgrade your plan.",
            code="template_not_in_plan",
        )


def check_storage_limit(user, current_usage_mb: float, new_file_size_mb: float) -> None:
    """Raise LimitExceededError if uploading a new file would exceed storage."""

    plan = get_effective_plan(user)

    if plan is None:
        raise LimitExceededError(
            "An active membership plan is required to upload media.",
            code="no_active_plan",
        )

    if (current_usage_mb + new_file_size_mb) > plan.storage_limit_mb:
        raise LimitExceededError(
            f"Storage limit reached. Your {plan.name} plan allows up to "
            f"{plan.storage_limit_mb} MB.",
            code="storage_limit_exceeded",
        )


def check_gallery_access(user) -> None:
    """Raise LimitExceededError if the user's plan does not include gallery access."""

    plan = get_effective_plan(user)

    if plan is None or not plan.gallery_enabled:
        raise LimitExceededError(
            "Your current plan does not include gallery access.",
            code="gallery_not_available",
        )


def check_qr_code_access(user) -> None:
    """Raise LimitExceededError if the user's plan does not include QR code access."""

    plan = get_effective_plan(user)

    if plan is None or not plan.qr_code_enabled:
        raise LimitExceededError(
            "Your current plan does not include QR code access.",
            code="qr_code_not_available",
        )


def check_photographer_access(user) -> None:
    """Raise LimitExceededError if the user's plan does not allow photographer access."""

    plan = get_effective_plan(user)

    if plan is None or not plan.photographer_access_enabled:
        raise LimitExceededError(
            "Your current plan does not include photographer access.",
            code="photographer_access_not_available",
        )
