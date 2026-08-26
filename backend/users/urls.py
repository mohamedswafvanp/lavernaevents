from django.urls import path

from .views import (
    ForgotPasswordView,
    ResendOTPView,
    ResetPasswordView,
    UserLoginView,
    UserLogoutView,
    UserRegistrationView,
    UserTokenRefreshView,
    VerifyMobileView,
)


urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("verify-mobile/", VerifyMobileView.as_view(), name="verify-mobile"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend-otp"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("refresh/", UserTokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", UserLogoutView.as_view(), name="logout"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]
