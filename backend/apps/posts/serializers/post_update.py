from rest_framework import serializers

from apps.posts.models import Post


class PostUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating blog posts.
    """

    class Meta:
        model = Post
        fields = (
            "title",
            "excerpt",
            "content",
        )

    def update(self, instance, validated_data):
        """
        Update the post.
        """

        user = self.context["request"].user

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.updated_by = user

        instance.save()

        return instance
