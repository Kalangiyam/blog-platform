from rest_framework import serializers

from apps.posts.models import Post

from .author import AuthorSerializer


class PostDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving a single blog post.
    """

    author = AuthorSerializer(read_only=True)

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
        )

        read_only_fields = fields