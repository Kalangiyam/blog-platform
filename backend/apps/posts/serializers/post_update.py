from rest_framework import serializers

from apps.posts.models import Post
from apps.categories.models import Category


class PostUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating blog posts.
    """

    category_slugs = serializers.ListField(
        child=serializers.SlugField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="List of category slugs to assign to the post.",
    )

    class Meta:
        model = Post
        fields = (
            "title",
            "excerpt",
            "content",
            "category_slugs",
        )

    def validate_category_slugs(self, value):
        """
        Validate category slugs and return Category objects.
        """

        if not value:
            return []

        # Reject duplicate slugs
        if len(value) != len(set(value)):
            raise serializers.ValidationError(
                "Duplicate category slugs are not allowed."
            )

        categories = list(
            Category.objects.filter(
                slug__in=value,
                is_active=True,
            )
        )

        # Ensure every slug exists and is active
        if len(categories) != len(value):
            raise serializers.ValidationError(
                "One or more categories do not exist or are inactive."
            )

        return categories

    def update(self, instance, validated_data):
        """
        Update the post.
        """

        user = self.context["request"].user

        categories = validated_data.pop("category_slugs", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.updated_by = user

        instance.save()

        if categories is not None:
            instance.categories.set(categories)

        return instance
