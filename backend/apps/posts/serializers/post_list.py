from rest_framework import serializers

from apps.posts.models import Post

from .author import AuthorSerializer
from .post_category import PostCategorySerializer
from .post_featured_image_mixin import (
    PostFeaturedImageRepresentationMixin,
)
from .post_tag import PostTagSerializer


class PostListSerializer(
    PostFeaturedImageRepresentationMixin,
    serializers.ModelSerializer,
):
    """
    Serializer for listing blog posts.
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
            "featured_image_url",
            "author",
            "published_at",
            "categories",
            "tags",
        )

        read_only_fields = fields