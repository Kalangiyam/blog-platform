from rest_framework import serializers

from ..models import Comment
from .comment_validation_mixin import CommentContentValidationMixin

class CommentUpdateSerializer(
    CommentContentValidationMixin,
    serializers.ModelSerializer,
):

    class Meta:
        model = Comment
        fields = (
            "content",
        )