from rest_framework import serializers

from apps.posts.models import Post

from .author import AuthorSerializer


class PostListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing blog posts.
    """

    author = AuthorSerializer(read_only=True)

    class Meta:
        model = Post
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "author",
            "published_at",
        )

        read_only_fields = fields