from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.core.validators import FileExtensionValidator

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model for LavernaEvents."""

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        ORGANIZER = "ORGANIZER", "Organizer"
        PHOTOGRAPHER = "PHOTOGRAPHER", "Photographer"
        GUEST = "GUEST", "Guest"

    full_name = models.CharField(
        max_length=150,
    )

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    mobile_number = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
    )

    profile_image = models.ImageField(
        upload_to="users/profile/",
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(
                allowed_extensions=["jpg", "jpeg", "png"]
            )
        ],
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ORGANIZER,
    )

    is_verified = models.BooleanField(
        default=False,
    )

    is_active = models.BooleanField(
        default=True,
    )

    is_staff = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    objects = UserManager()

    USERNAME_FIELD = "mobile_number"

    REQUIRED_FIELDS = [
        "email",
        "full_name",
    ]

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.mobile_number})"
