from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model for the Blog Platform.

    We inherit from AbstractUser so we keep Django's built-in
    authentication, permissions, groups, and admin compatibility
    while allowing future customization.
    """

    email = models.EmailField(
        unique=True,
        verbose_name="Email Address",
        help_text="User's unique email address.",
    )

    is_email_verified = models.BooleanField(
        default=False,
        verbose_name="Email Verified Status",
        help_text="Designates whether the user's email address is verified.",
    )

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username