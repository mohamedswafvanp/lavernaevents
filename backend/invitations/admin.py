from django.contrib import admin

from .models import Invitation, InvitationTemplate


@admin.register(InvitationTemplate)
class InvitationTemplateAdmin(admin.ModelAdmin):
    """Admin configuration for the invitation template catalog."""

    list_display = (
        "name",
        "is_active",
        "display_order",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "display_order",
        "name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    """Admin configuration for generated invitations."""

    list_display = (
        "guest",
        "event",
        "template",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "template",
    )

    search_fields = (
        "guest__name",
        "guest__mobile_number",
        "event__name",
        "response_token",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "response_token",
        "created_at",
        "updated_at",
    )
