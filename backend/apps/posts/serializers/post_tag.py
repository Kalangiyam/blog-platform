from rest_framework import serializers

from apps.tags.models import Tag


class PostTagSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for representing tags in post responses.
    """

    class Meta:
        model = Tag
        fields = (
            "name",
            "slug",
        )