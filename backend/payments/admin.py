from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for viewing payment records."""

    list_display = (
        "user",
        "plan",
        "amount",
        "currency",
        "status",
        "razorpay_order_id",
        "created_at",
    )

    list_filter = (
        "status",
        "plan",
    )

    search_fields = (
        "user__mobile_number",
        "user__email",
        "razorpay_order_id",
        "razorpay_payment_id",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_signature",
        "created_at",
        "updated_at",
    )
