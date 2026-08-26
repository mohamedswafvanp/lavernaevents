from django.urls import path

from .views import CreatePaymentOrderView, VerifyPaymentView


urlpatterns = [
    path("create-order/", CreatePaymentOrderView.as_view(), name="create-order"),
    path("verify/", VerifyPaymentView.as_view(), name="verify-payment"),
]
