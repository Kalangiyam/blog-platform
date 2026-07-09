from rest_framework import serializers

from apps.categories.models import Category


class CategoryUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a category.
    """

    class Meta:
        model = Category
        fields = (
            "name",
        )

    def validate_name(self, value):
        """
        Normalize and validate the updated category name.
        """
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Category name cannot be blank."
            )

        queryset = Category.objects.filter(
            name__iexact=value
        ).exclude(
            pk=self.instance.pk
        )

        if queryset.exists():
            raise serializers.ValidationError(
                "A category with this name already exists."
            )

        return value