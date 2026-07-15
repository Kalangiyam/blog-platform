from rest_framework import serializers

from ..models import Comment
from .author import AuthorSerializer

class CommentListSerializer(serializers.ModelSerializer):

    author = AuthorSerializer(
        read_only=True,
    )

    class Meta:
        model = Comment
        fields = (
            "id",
            "content",
            "author",
            "created_at",
            "updated_at",
        )

        read_only_fields = fields