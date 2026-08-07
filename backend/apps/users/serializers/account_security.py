from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        new_pass = attrs.get("new_password")
        confirm_pass = attrs.get("confirm_password")

        if new_pass != confirm_pass:
            raise serializers.ValidationError(
                {"confirm_password": ["New passwords do not match."]}
            )

        user = self.context.get("request").user if self.context.get("request") else None
        validate_password(new_pass, user=user)

        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        new_pass = attrs.get("new_password")
        confirm_pass = attrs.get("confirm_password")

        if new_pass != confirm_pass:
            raise serializers.ValidationError(
                {"confirm_password": ["Passwords do not match."]}
            )

        validate_password(new_pass)

        return attrs


class EmailVerifyConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
