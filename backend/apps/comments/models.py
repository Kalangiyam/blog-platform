from django.conf import settings
from django.db import models

from apps.core.models import (
    AuditModel,
    SoftDeleteModel,
    TimeStampedModel,
)


class Comment(
    TimeStampedModel,
    AuditModel,
    SoftDeleteModel,
):
    post = models.ForeignKey(
        "posts.Post",
        on_delete=models.CASCADE,
        related_name="comments",
        help_text="The post this comment belongs to.",
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
        help_text="The user who authored this comment.",
    )

    content = models.TextField(
        max_length=2000,
        help_text="The content of the comment.",
    )

    class Meta:
        ordering = ("created_at", "id")
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return f"Comment by {self.author} on {self.post}"