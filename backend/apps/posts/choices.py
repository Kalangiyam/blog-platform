from django.db import models


class PostStatus(models.TextChoices):
    """
    Enumeration representing the lifecycle state of a blog post.
    """

    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"