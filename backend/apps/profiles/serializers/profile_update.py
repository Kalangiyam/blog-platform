from rest_framework import serializers
from django.utils import timezone

from apps.profiles.models import Profile


class ProfileUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = (
            "bio",
            "website",
            "location",
            "date_of_birth",
        )
