from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Profile(TimeStampedModel):
    """
    Store public and personal profile information for one application user.

    Authentication data remains in the User model. This model exists only
    for profile-related information that may grow independently over time.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    bio = models.TextField(
        max_length=500,
        blank=True,
    )

    website = models.URLField(
        blank=True,
    )

    location = models.CharField(
        max_length=100,
        blank=True,
    )
    
    date_of_birth = models.DateField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["user__username"]

    def __str__(self):
        return f"{self.user.username}'s profile"
