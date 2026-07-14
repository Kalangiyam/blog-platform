from rest_framework import serializers

from apps.posts.models import Post
from apps.categories.models import Category
from apps.tags.models import Tag
from apps.posts.serializers.post_txonomy_mixin import TaxonomyAssignmentMixin


class PostUpdateSerializer(TaxonomyAssignmentMixin,serializers.ModelSerializer):
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
    
    tag_slugs = serializers.ListField(
        child=serializers.SlugField(),
        required=False,
        allow_empty=True,
        write_only=True,
        help_text="List of tag slugs to assign to the post.",
    )

    class Meta:
        model = Post
        fields = (
            "title",
            "excerpt",
            "content",
            "category_slugs",
            "tag_slugs",
        )

    def validate_category_slugs(self, value):
        """
        Validate category slugs and return Category objects.
        """

        return self.validate_taxonomy_slugs(
            value,
            model=Category,
            duplicate_error="Duplicate category slugs are not allowed.",
            invalid_error=(
                "One or more categories do not exist or are inactive."
            ),
        )

    def validate_tag_slugs(self, value):
        """
        Validate tag slugs and return Tag objects.
        """

        return self.validate_taxonomy_slugs(
            value,
            model=Tag,
            duplicate_error="Duplicate tag slugs are not allowed.",
            invalid_error=(
                "One or more tags do not exist or are inactive."
            ),
        )

    def update(self, instance, validated_data):
        """
        Update the post.
        """

        user = self.context["request"].user

        categories = validated_data.pop("category_slugs", None)
        tags = validated_data.pop("tag_slugs", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.updated_by = user

        instance.save()

        if categories is not None:
            instance.categories.set(categories)

        if tags is not None:
            instance.tags.set(tags)

        return instance
