from django.utils.text import slugify
from rest_framework import serializers

from apps.posts.models import Post


class PostCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating blog posts.
    """

    class Meta:
        model = Post
        fields = (
            "title",
            "excerpt",
            "content",
        )

    def create(self, validated_data):
        """
        Create a new blog post.
        """

        request = self.context["request"]
        user = request.user

        slug = self._generate_unique_slug(validated_data["title"])

        return Post.objects.create(
            author=user,
            created_by=user,
            updated_by=user,
            slug=slug,
            **validated_data,
        )

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
