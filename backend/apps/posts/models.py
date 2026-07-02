from django.db import models
from django.conf import settings

from apps.core.models import (
    AuditModel,
    SoftDeleteModel,
    TimeStampedModel,
)


class Post(
    TimeStampedModel,
    AuditModel,
    SoftDeleteModel,
):
    """
    Represents a blog post.
    """

    title = models.CharField(
        max_length=255,
        help_text="The title of the blog post.",
    )

    slug = models.SlugField(
        max_length=255,
        unique=True,
        help_text="URL-friendly unique identifier for the post.",
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
        help_text="The user who owns this post.",
    )

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __str__(self):
        return self.title