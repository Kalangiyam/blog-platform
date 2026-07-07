from django.utils import timezone
from rest_framework import serializers

from apps.posts.choices import PostStatus
from apps.posts.models import Post


class PostPublishSerializer(serializers.Serializer):
    """
    Handles publishing a draft post.
    """

    def update(self, instance: Post, validated_data):
        if instance.status != PostStatus.DRAFT:
            raise serializers.ValidationError(
                {"detail": "Only draft posts can be published."}
            )

        instance.status = PostStatus.PUBLISHED
        instance.published_at = timezone.now()
        instance.save(update_fields=["status", "published_at", "updated_at"])

        return instance

    def create(self, validated_data):
        raise NotImplementedError(
            "PostPublishSerializer does not support object creation."
        )


class PostUnpublishSerializer(serializers.Serializer):
    """
    Handles moving a published post back to draft.
    """

    def update(self, instance: Post, validated_data):
        if instance.status != PostStatus.PUBLISHED:
            raise serializers.ValidationError(
                {"detail": "Only published posts can be unpublished."}
            )

        instance.status = PostStatus.DRAFT
        instance.published_at = None
        instance.save(update_fields=["status", "published_at", "updated_at"])

        return instance

    def create(self, validated_data):
        raise NotImplementedError(
            "PostUnpublishSerializer does not support object creation."
        )
