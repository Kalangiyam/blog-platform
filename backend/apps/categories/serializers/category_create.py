from django.utils.text import slugify

from rest_framework import serializers

from apps.categories.models import Category


class CategoryCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a category.
    """

    class Meta:
        model = Category
        fields = ("name",)

    def validate_name(self, value):
        """
        Normalize and validate the category name.
        """
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Category name cannot be blank.")

        if Category.all_objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                "A category with this name already exists."
            )

        return value

    def create(self, validated_data):
        validated_data["slug"] = slugify(validated_data["name"])
        return Category.objects.create(**validated_data)
