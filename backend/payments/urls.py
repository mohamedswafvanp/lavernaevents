from django.urls import path

from .views import (
    CreateCheckoutSessionView,
    PaymentStatusView,
    StripeWebhookView,
)


urlpatterns = [
    path("create-checkout-session/", CreateCheckoutSessionView.as_view(), name="create-checkout-session"),
    path("status/<str:session_id>/", PaymentStatusView.as_view(), name="payment-status"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
