from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class AuthorSerializer(serializers.ModelSerializer):
    """
    Public serializer for a comment author.

    This serializer intentionally exposes only the
    information required by clients consuming comment APIs.
    """

    class Meta:
        model = User
        fields = (
            "id",
            "username",
        )
        read_only_fields = fields