from django.db import models

from apps.core.models import (
    ActiveStatusModel,
    AuditModel,
    TimeStampedModel,
)
from ..core.managers import ActiveStatusManager


class Category(TimeStampedModel, AuditModel, ActiveStatusModel):
    """
    Represents a reusable category used to organize blog posts.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique category name.",
    )

    slug = models.SlugField(
        max_length=100,
        unique=True,
        editable=False,
        help_text="URL-friendly unique identifier for the category.",
    )

    objects = ActiveStatusManager()
    all_objects = models.Manager()

    class Meta:
        ordering = ["name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name
