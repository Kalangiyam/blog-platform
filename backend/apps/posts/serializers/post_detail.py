from rest_framework import serializers

from apps.posts.models import Post

from .author import AuthorSerializer
from .post_category import PostCategorySerializer
from .post_featured_image_mixin import (
    PostFeaturedImageRepresentationMixin,
)
from .post_tag import PostTagSerializer


class PostDetailSerializer(
    PostFeaturedImageRepresentationMixin,
    serializers.ModelSerializer,
):
    """
    Serializer for retrieving a single blog post.
    """

    featured_image_url = serializers.SerializerMethodField()

    author = AuthorSerializer(read_only=True)

    categories = PostCategorySerializer(
        many=True,
        read_only=True,
    )

    tags = PostTagSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "featured_image_url",
            "status",
            "author",
            "published_at",
            "created_at",
            "updated_at",
            "categories",
            "tags",
        )

        read_only_fields = fields