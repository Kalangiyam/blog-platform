from rest_framework import serializers

class CommentContentValidationMixin:

    def validate_content(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Comment content cannot be empty."
            )

        return value