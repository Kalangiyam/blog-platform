from django.conf import settings
from django.db import models


class AuditModel(models.Model):
    """
    Abstract base model that tracks
    who created and last updated a record.
    """

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_%(class)ss",
        help_text="The user who created this record.",
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_%(class)ss",
        help_text="The user who last updated this record.",
    )

    class Meta:
        abstract = True
