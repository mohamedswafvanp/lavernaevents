from django.contrib import admin

from .models import WhatsAppLog


@admin.register(WhatsAppLog)
class WhatsAppLogAdmin(admin.ModelAdmin):
    """Admin configuration for WhatsApp send logs."""

    list_display = (
        "guest",
        "status",
        "retry_count",
        "created_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "guest__name",
        "guest__mobile_number",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "wa_link",
        "created_at",
        "updated_at",
    )
