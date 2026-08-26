from rest_framework import serializers

from .models import MembershipPlan, Subscription


class MembershipPlanSerializer(serializers.ModelSerializer):
    """Serializer for listing and viewing membership plans (public, read-only)."""

    template_names = serializers.SerializerMethodField()

    class Meta:
        model = MembershipPlan
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "price",
            "duration_days",
            "guest_limit",
            "event_limit",
            "template_names",
            "storage_limit_mb",
            "gallery_enabled",
            "qr_code_enabled",
            "photographer_access_enabled",
            "display_order",
        )
        read_only_fields = fields

    def get_template_names(self, obj: MembershipPlan) -> list:
        """Return the names of templates included with this plan, for the pricing page."""

        return list(
            obj.templates.filter(is_active=True).values_list("name", flat=True)
        )


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for reading a user's subscription, with nested plan details."""

    plan = MembershipPlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = (
            "id",
            "plan",
            "status",
            "started_at",
            "expires_at",
            "cancelled_at",
        )
        read_only_fields = fields


class SubscribeSerializer(serializers.Serializer):
    """Serializer for validating a subscribe request."""

    plan_slug = serializers.SlugField(required=True)


class ChangePlanSerializer(serializers.Serializer):
    """Serializer for validating an upgrade/downgrade request."""

    plan_slug = serializers.SlugField(required=True)


class MyUsageSerializer(serializers.Serializer):
    """Serializer for reporting the user's current plan and usage limits.

    Actual usage counts (events_used, guests_used, etc.) default to 0
    here since the Events/Guests/Gallery modules do not exist yet.
    Those modules will supply real counts once built.
    """

    plan_name = serializers.CharField()
    has_active_plan = serializers.BooleanField()

    guest_limit = serializers.IntegerField(allow_null=True)
    event_limit = serializers.IntegerField(allow_null=True)
    template_count = serializers.IntegerField(allow_null=True)
    storage_limit_mb = serializers.IntegerField(allow_null=True)

    gallery_enabled = serializers.BooleanField()
    qr_code_enabled = serializers.BooleanField()
    photographer_access_enabled = serializers.BooleanField()
