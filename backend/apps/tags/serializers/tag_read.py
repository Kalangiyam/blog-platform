from rest_framework import serializers

from apps.tags.models import Tag


class TagReadSerializer(serializers.ModelSerializer):
    """
    Serializer for listing and retrieving tags.
    """

    class Meta:
        model = Tag
        fields = (
            "id",
            "name",
            "slug",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields