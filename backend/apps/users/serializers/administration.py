from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.users.constants import APPLICATION_GROUPS
from apps.users.services import (
    ApplicationRoleConfigurationError,
    LastActiveAdministratorError,
    SelfAdministratorRemovalError,
    SelfDeactivationError,
    UserAdministrationService,
)

User = get_user_model()


class ApplicationRoleListMixin:
    """
    Provide consistent application-role serialization.

    Only application-managed Groups are exposed. Unrelated Django Groups
    remain private and are not included in API responses.
    """

    def get_roles(self, obj):
        """
        Return application role names assigned to the user.
        """
        return [
            group.name for group in obj.groups.all() if group.name in APPLICATION_GROUPS
        ]


class EmptyRequestSerializerMixin:
    """
    Reject request bodies containing unsupported fields.
    """

    def to_internal_value(self, data):
        """
        Accept only an empty object.
        """
        if data:
            raise serializers.ValidationError(
                {
                    "detail": "This endpoint does not accept request data.",
                }
            )

        return super().to_internal_value(data)


class AdminUserCreateSerializer(
    ApplicationRoleListMixin,
    serializers.ModelSerializer,
):
    """
    Validate and create a user through the administration service.

    This serializer does not create users directly. The service layer owns
    atomic user creation and role assignment.
    """

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={
            "input_type": "password",
        },
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={
            "input_type": "password",
        },
    )
    roles = serializers.ListField(
        child=serializers.ChoiceField(
            choices=APPLICATION_GROUPS,
        ),
        allow_empty=True,
        required=False,
        write_only=True,
    )
    # assigned_roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "roles",
            # "assigned_roles",
            "is_active",
            "date_joined",
        )
        read_only_fields = (
            "id",
            # "assigned_roles",
            "is_active",
            "date_joined",
        )
        extra_kwargs = {
            "email": {
                "required": True,
            },
            "username": {
                "required": True,
            },
            "first_name": {
                "required": False,
                "allow_blank": True,
            },
            "last_name": {
                "required": False,
                "allow_blank": True,
            },
        }

    # def get_assigned_roles(self, obj):
    #     """
    #     Return application roles assigned after user creation.
    #     """
    #     return self.get_roles(obj)

    def validate_email(self, value):
        """
        Prevent case-insensitive duplicate email addresses.
        """
        normalized_email = value.strip().lower()

        if User.objects.filter(
            email__iexact=normalized_email,
        ).exists():
            raise serializers.ValidationError("A user with this email already exists.")

        return normalized_email

    def validate_roles(self, roles):
        """
        Prevent duplicate role names in the request.
        """
        if len(roles) != len(set(roles)):
            raise serializers.ValidationError("Duplicate roles are not allowed.")

        return roles

    def validate(self, attrs):
        """
        Ensure password confirmation matches the submitted password.
        """
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm": "Passwords do not match.",
                }
            )

        return attrs

    def create(self, validated_data):
        """
        Create the user and assign application roles atomically.
        """
        validated_data.pop("password_confirm")
        roles = validated_data.pop("roles", [])

        try:
            return UserAdministrationService.create_user(
                roles=roles,
                **validated_data,
            )
        except ApplicationRoleConfigurationError as exc:
            raise serializers.ValidationError(
                {
                    "roles": exc.message,
                }
            ) from exc

    def to_representation(self, instance):
        """
        Return the standard Administrator-facing detail response.
        """
        return AdminUserDetailSerializer(
            instance,
            context=self.context,
        ).data


class AdminUserListSerializer(
    ApplicationRoleListMixin,
    serializers.ModelSerializer,
):
    """
    Serialize users for the Administrator user-list endpoint.
    """

    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "roles",
            "date_joined",
        )


class AdminUserDetailSerializer(
    ApplicationRoleListMixin,
    serializers.ModelSerializer,
):
    """
    Serialize detailed user information for Administrators.

    Password hashes, staff status, superuser status, direct permissions,
    and unrelated Django Groups are intentionally excluded.
    """

    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "roles",
            "date_joined",
            "last_login",
        )


class UserRoleUpdateSerializer(serializers.Serializer):
    """
    Validate complete replacement of application-managed roles.
    """

    roles = serializers.ListField(
        child=serializers.ChoiceField(
            choices=APPLICATION_GROUPS,
        ),
        allow_empty=True,
    )

    def validate_roles(self, roles):
        """
        Reject duplicate role names.
        """
        if len(roles) != len(set(roles)):
            raise serializers.ValidationError("Duplicate roles are not allowed.")

        return roles

    def update(self, instance, validated_data):
        """
        Replace the target user's application roles through the service layer.
        """
        actor = self.context["request"].user

        try:
            return UserAdministrationService.replace_application_roles(
                actor=actor,
                target_user_id=instance.pk,
                roles=validated_data["roles"],
            )
        except SelfAdministratorRemovalError as exc:
            raise serializers.ValidationError(
                {
                    "roles": exc.message,
                }
            ) from exc
        except LastActiveAdministratorError as exc:
            raise serializers.ValidationError(
                {
                    "roles": exc.message,
                }
            ) from exc
        except ApplicationRoleConfigurationError as exc:
            raise serializers.ValidationError(
                {
                    "roles": exc.message,
                }
            ) from exc

    def create(self, validated_data):
        """
        Role replacement requires an existing user instance.
        """
        raise NotImplementedError(
            "UserRoleUpdateSerializer requires an existing user instance."
        )


class UserActivationSerializer(EmptyRequestSerializerMixin, serializers.Serializer):
    """
    Activate an existing user through the administration service.

    The request body is intentionally empty.
    """

    def update(self, instance, validated_data):
        """
        Activate the target user.
        """
        return UserAdministrationService.activate_user(
            target_user_id=instance.pk,
        )

    def create(self, validated_data):
        """
        Activation requires an existing user instance.
        """
        raise NotImplementedError(
            "UserActivationSerializer requires an existing user instance."
        )


class UserDeactivationSerializer(EmptyRequestSerializerMixin, serializers.Serializer):
    """
    Deactivate an existing user through the administration service.

    The request body is intentionally empty.
    """

    def update(self, instance, validated_data):
        """
        Deactivate the target user while enforcing Administrator safeguards.
        """
        actor = self.context["request"].user

        try:
            return UserAdministrationService.deactivate_user(
                actor=actor,
                target_user_id=instance.pk,
            )
        except SelfDeactivationError as exc:
            raise serializers.ValidationError(
                {
                    "detail": exc.message,
                }
            ) from exc
        except LastActiveAdministratorError as exc:
            raise serializers.ValidationError(
                {
                    "detail": exc.message,
                }
            ) from exc
        except ApplicationRoleConfigurationError as exc:
            raise serializers.ValidationError(
                {
                    "detail": exc.message,
                }
            ) from exc
