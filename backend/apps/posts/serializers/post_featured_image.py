from rest_framework import serializers

from apps.posts.validators import (
    validate_post_featured_image_upload,
)


class PostFeaturedImageUploadSerializer(serializers.Serializer):
    """
    Validate a featured-image upload request.
    """

    image = serializers.FileField(
        required=True,
        allow_empty_file=False,
        validators=[
            validate_post_featured_image_upload,
        ],
    )

class PostFeaturedImageResponseSerializer(serializers.Serializer):
    """
    Serialize the featured image URL.
    """

    featured_image_url = serializers.URLField(
        allow_null=True,
    )