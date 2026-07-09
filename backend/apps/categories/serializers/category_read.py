from rest_framework import serializers

from apps.categories.models import Category


class CategoryReadSerializer(serializers.ModelSerializer):
    """
    Serializer for listing and retrieving categories.
    """

    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "slug",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields