from rest_framework import serializers

from apps.tags.models import Tag


class TagUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a tag.
    """

    class Meta:
        model = Tag
        fields = (
            "name",
        )

    def validate_name(self, value):
        """
        Normalize and validate the updated tag name.
        """
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Tag name cannot be blank."
            )

        queryset = Tag.all_objects.filter(
            name__iexact=value
        ).exclude(
            pk=self.instance.pk
        )

        if queryset.exists():
            raise serializers.ValidationError(
                "A tag with this name already exists."
            )

        return value