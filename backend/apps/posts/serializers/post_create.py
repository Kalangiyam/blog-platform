from django.utils.text import slugify
from rest_framework import serializers

from apps.posts.models import Post
from apps.categories.models import Category
from apps.tags.models import Tag
from apps.posts.serializers.post_txonomy_mixin import TaxonomyAssignmentMixin


class PostCreateSerializer(TaxonomyAssignmentMixin, serializers.ModelSerializer):
    """
    Serializer for creating blog posts.
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

    def create(self, validated_data):
        """
        Create a new blog post.
        """

        user = self.context["request"].user

        categories = validated_data.pop("category_slugs",[])
        tags = validated_data.pop("tag_slugs",[])

        slug = self._generate_unique_slug(validated_data["title"])

        post = Post.objects.create(
            author=user,
            created_by=user,
            updated_by=user,
            slug=slug,
            **validated_data,
        )

        post.categories.set(categories)
        post.tags.set(tags)

        return post

    def _generate_unique_slug(self, title: str) -> str:
        """
        Generate a unique slug for a post.
        """

        base_slug = slugify(title)
        slug = base_slug
        counter = 2

        while Post.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug
