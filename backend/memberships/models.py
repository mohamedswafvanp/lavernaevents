from django.db import models


class MembershipPlan(models.Model):
    """A subscription plan that controls feature limits for organizers."""

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    duration_days = models.PositiveIntegerField(
        default=30,
        help_text="Number of days this plan is valid for after activation.",
    )

    guest_limit = models.PositiveIntegerField(
        default=50,
        help_text="Maximum number of guests allowed per event.",
    )

    event_limit = models.PositiveIntegerField(
        default=1,
        help_text="Maximum number of active events allowed.",
    )

    templates = models.ManyToManyField(
        "invitations.InvitationTemplate",
        related_name="plans",
        blank=True,
        help_text="The specific invitation templates organizers on this plan may use.",
    )

    storage_limit_mb = models.PositiveIntegerField(
        default=500,
        help_text="Maximum media storage allowed, in megabytes.",
    )

    gallery_enabled = models.BooleanField(
        default=True,
    )

    qr_code_enabled = models.BooleanField(
        default=True,
    )

    photographer_access_enabled = models.BooleanField(
        default=False,
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Inactive plans are hidden from new subscriptions.",
    )

    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Controls the order plans are shown on the pricing page.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "membership_plans"
        ordering = ["display_order", "price"]

    def __str__(self) -> str:
        return self.name


class Subscription(models.Model):
    """Tracks a user's active or historical membership plan subscription."""

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        EXPIRED = "EXPIRED", "Expired"
        CANCELLED = "CANCELLED", "Cancelled"

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )

    plan = models.ForeignKey(
        MembershipPlan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    started_at = models.DateTimeField(
        auto_now_add=True,
    )

    expires_at = models.DateTimeField()

    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "subscriptions"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.mobile_number} - {self.plan.name} ({self.status})"
