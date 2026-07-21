from django.db import models
from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVector

from apps.core.models import (
    AuditModel,
    SoftDeleteModel,
    TimeStampedModel,
)
from apps.posts.choices import PostStatus
from apps.posts.constants import POST_SEARCH_CONFIG
from apps.posts.managers import PostManager


class Post(
    TimeStampedModel,
    AuditModel,
    SoftDeleteModel,
):
    """
    Represents a blog post.
    """

    objects = PostManager()

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

    categories = models.ManyToManyField(
        "categories.Category",
        related_name="posts",
        blank=True,
        help_text="Categories used to organize this post.",
    )

    tags = models.ManyToManyField(
        "tags.Tag",
        related_name="posts",
        blank=True,
        help_text="Tags used to organize this post.",
    )

    excerpt = models.TextField(
        blank=True,
        help_text="Optional short summary of the blog post.",
    )

    content = models.TextField(
        help_text="Main content of the blog post.",
    )

    status = models.CharField(
        max_length=20,
        choices=PostStatus.choices,
        default=PostStatus.DRAFT,
        help_text="Current publication status of the post.",
    )

    published_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="The date and time when the post was published.",
    )

    class Meta:
        ordering = (
            "-published_at",
            "-created_at",
        )
        verbose_name = "Post"
        verbose_name_plural = "Posts"

        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["published_at"]),
            models.Index(fields=["author"]),
            GinIndex(
                SearchVector(
                    "title",
                    weight="A",
                    config=POST_SEARCH_CONFIG,
                )
                + SearchVector(
                    "excerpt",
                    weight="B",
                    config=POST_SEARCH_CONFIG,
                )
                + SearchVector(
                    "content",
                    weight="C",
                    config=POST_SEARCH_CONFIG,
                ),
                name="post_search_vector_gin",
            ),
        ]

    def __str__(self):
        return self.title
