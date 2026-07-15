from rest_framework import serializers

from apps.comments.models import Comment
from .comment_validation_mixin import CommentContentValidationMixin

class CommentCreateSerializer(
    CommentContentValidationMixin,
    serializers.ModelSerializer,
):

    class Meta:
        model = Comment
        fields = (
            "content",
        )