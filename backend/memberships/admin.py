from django.contrib import admin

from .models import MembershipPlan, Subscription


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    """Admin configuration for membership plans."""

    list_display = (
        "name",
        "price",
        "duration_days",
        "guest_limit",
        "event_limit",
        "template_count",
        "storage_limit_mb",
        "is_active",
        "display_order",
    )

    list_filter = (
        "is_active",
        "gallery_enabled",
        "qr_code_enabled",
        "photographer_access_enabled",
    )

    search_fields = (
        "name",
        "slug",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    filter_horizontal = (
        "templates",
    )

    ordering = (
        "display_order",
        "price",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Plan Information",
            {
                "fields": (
                    "name",
                    "slug",
                    "description",
                    "price",
                    "duration_days",
                    "is_active",
                    "display_order",
                )
            },
        ),
        (
            "Limits",
            {
                "fields": (
                    "guest_limit",
                    "event_limit",
                    "storage_limit_mb",
                )
            },
        ),
        (
            "Invitation Templates",
            {
                "fields": (
                    "templates",
                ),
                "description": (
                    "Select which invitation templates organizers on "
                    "this plan are allowed to use."
                ),
            },
        ),
        (
            "Feature Access",
            {
                "fields": (
                    "gallery_enabled",
                    "qr_code_enabled",
                    "photographer_access_enabled",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.display(description="Templates")
    def template_count(self, obj: MembershipPlan) -> int:
        """Show how many templates are assigned to this plan in the list view."""

        return obj.templates.count()


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """Admin configuration for user subscriptions."""

    list_display = (
        "user",
        "plan",
        "status",
        "started_at",
        "expires_at",
    )

    list_filter = (
        "status",
        "plan",
    )

    search_fields = (
        "user__mobile_number",
        "user__email",
        "user__full_name",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "started_at",
        "created_at",
        "updated_at",
    )
