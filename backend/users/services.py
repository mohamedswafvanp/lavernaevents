from django.core.mail import send_mail

from .models import EmailOTP, User


def send_verification_otp(user: User) -> EmailOTP:
    """Generate and email a fresh OTP code to the user for email verification."""

    otp = EmailOTP.create_for_user(user)

    send_mail(
        subject="Verify your LavernaEvents account",
        message=(
            f"Hello {user.full_name},\n\n"
            f"Your LavernaEvents verification code is: {otp.code}\n\n"
            "This code will expire in 10 minutes. If you did not create "
            "this account, please ignore this email."
        ),
        from_email=None,
        recipient_list=[user.email],
        fail_silently=True,
    )

    return otp


def verify_otp_code(email: str, code: str) -> tuple[bool, str]:
    """Validate an OTP code for the given email.

    Returns a tuple of (success, message). On success, marks the user
    as verified and the OTP as used.
    """

    user = User.objects.filter(email__iexact=email).first()

    if user is None:
        return False, "No account found with this email."

    if user.is_verified:
        return False, "This account is already verified."

    otp = (
        EmailOTP.objects.filter(
            user=user,
            code=code,
            is_used=False,
        )
        .order_by("-created_at")
        .first()
    )

    if otp is None:
        return False, "Invalid verification code."

    if not otp.is_valid():
        return False, "This verification code has expired."

    otp.is_used = True
    otp.save(update_fields=["is_used"])

    user.is_verified = True
    user.save(update_fields=["is_verified"])

    return True, "Email verified successfully."
