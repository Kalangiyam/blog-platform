from rest_framework import serializers

from apps.profiles.models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )
    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = Profile
        fields = (
            "username",
            "email",
            "bio",
            "website",
            "location",
            "date_of_birth",
        )

        read_only_fields = fields
