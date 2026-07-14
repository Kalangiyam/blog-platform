from rest_framework import serializers

from apps.posts.models import Post

from .author import AuthorSerializer
from .post_category import PostCategorySerializer
from .post_tag import PostTagSerializer


class PostDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving a single blog post.
    """

    author = AuthorSerializer(read_only=True)

    categories = PostCategorySerializer(many=True, read_only=True)
    tags = PostTagSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "status",
            "author",
            "published_at",
            "created_at",
            "updated_at",
            "categories",
            "tags",
        )

        read_only_fields = fields
