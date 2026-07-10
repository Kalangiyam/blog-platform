from django.utils.text import slugify

from rest_framework import serializers

from apps.tags.models import Tag


class TagCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a tag.
    """

    class Meta:
        model = Tag
        fields = ("name",)

    def validate_name(self, value):
        """
        Normalize and validate the tag name.
        """
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Tag name cannot be blank."
            )

        if Tag.all_objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                "A tag with this name already exists."
            )

        return value

    def create(self, validated_data):
        validated_data["slug"] = slugify(validated_data["name"])
        return Tag.objects.create(**validated_data)