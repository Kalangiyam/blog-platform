from rest_framework import serializers

from apps.profiles.models import Profile


class PublicProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = Profile
        fields = (
            "username",
            "bio",
            "website",
            "location",
        )

        read_only_fields = fields
