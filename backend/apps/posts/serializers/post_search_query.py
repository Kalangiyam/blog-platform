from rest_framework import serializers


class PostSearchQuerySerializer(serializers.Serializer):
    """
    Validate query parameters used by the public Post search API.
    """

    q = serializers.CharField(
        min_length=2,
        max_length=100,
        trim_whitespace=True,
        required=True,
        allow_blank=False,
        help_text="Text used to search published blog posts.",
    )   