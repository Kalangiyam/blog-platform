from rest_framework import serializers

from apps.categories.models import Category


class PostCategorySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for representing categories in post responses.
    """

    class Meta:
        model = Category
        fields = (
            "name",
            "slug",
        )