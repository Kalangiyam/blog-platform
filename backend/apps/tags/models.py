from django.db import models

from apps.core.models import (
    ActiveStatusModel,
    AuditModel,
    TimeStampedModel,
)
from ..core.managers import ActiveStatusManager


class Tag(TimeStampedModel, AuditModel, ActiveStatusModel):
    """
    Represents a reusable tag used to describe blog posts.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique tag name.",
    )

    slug = models.SlugField(
        max_length=100,
        unique=True,
        editable=False,
        help_text="URL-friendly unique identifier for the tag.",
    )

    objects = ActiveStatusManager()
    all_objects = models.Manager()

    class Meta:
        ordering = ["name"]
        verbose_name = "Tag"
        verbose_name_plural = "Tags"

    def __str__(self):
        return self.name
