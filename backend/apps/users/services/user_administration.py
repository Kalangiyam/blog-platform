from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction

from apps.users.constants import (
    ADMINISTRATOR_GROUP,
    APPLICATION_GROUPS,
)
from apps.users.services.exceptions import (
    ApplicationRoleConfigurationError,
    LastActiveAdministratorError,
    SelfAdministratorRemovalError,
    SelfDeactivationError,
)

User = get_user_model()


class UserAdministrationService:
    """
    Coordinate Administrator-controlled user lifecycle operations.

    All modifying methods run inside database transactions. Application roles
    are limited to the role names defined in APPLICATION_GROUPS.
    """

    @classmethod
    @transaction.atomic
    def create_user(
        cls,
        *,
        username,
        email,
        password,
        roles,
        first_name="",
        last_name="",
    ):
        """
        Create an active user and assign approved application roles atomically.

        The password is passed to create_user(), ensuring it is hashed through
        Django's configured password hasher.
        """
        role_groups = cls._get_application_role_groups(
            roles,
            lock=True,
        )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
        )

        if role_groups:
            user.groups.add(*role_groups)

        return user

    @classmethod
    @transaction.atomic
    def activate_user(cls, *, target_user_id):
        """
        Activate the selected user.

        The operation is idempotent. Activating an already-active user returns
        the unchanged user instead of raising an error.
        """
        target_user = cls._get_locked_user(target_user_id)

        if target_user.is_active:
            return target_user

        target_user.is_active = True
        target_user.save(
            update_fields=[
                "is_active",
            ]
        )

        return target_user

    @classmethod
    @transaction.atomic
    def deactivate_user(cls, *, actor, target_user_id):
        """
        Deactivate the selected user while preserving Administrator continuity.

        Rules:

        - Administrators cannot deactivate themselves.
        - The final active Administrator cannot be deactivated.
        - Deactivating an already-inactive user is idempotent.
        """
        administrator_group = cls._get_locked_administrator_group()
        target_user = cls._get_locked_user(target_user_id)

        if actor.pk == target_user.pk:
            raise SelfDeactivationError(
                "Administrators cannot deactivate their own account."
            )

        if not target_user.is_active:
            return target_user

        target_is_administrator = target_user.groups.filter(
            pk=administrator_group.pk,
        ).exists()

        if target_is_administrator:
            cls._ensure_another_active_administrator_exists(
                excluded_user_id=target_user.pk,
                administrator_group=administrator_group,
            )

        target_user.is_active = False
        target_user.save(
            update_fields=[
                "is_active",
            ]
        )

        return target_user

    @classmethod
    @transaction.atomic
    def replace_application_roles(
        cls,
        *,
        actor,
        target_user_id,
        roles,
    ):
        """
        Replace only the target user's application-managed roles.

        Unrelated Django Groups are preserved.

        Rules:

        - Only roles in APPLICATION_GROUPS may be assigned.
        - Administrators cannot remove their own Administrator role.
        - The last active Administrator cannot lose that role.
        """
        administrator_group = cls._get_locked_administrator_group()
        target_user = cls._get_locked_user(target_user_id)

        requested_role_names = set(roles)
        requested_groups = cls._get_application_role_groups(
            requested_role_names,
            lock=True,
        )

        target_is_administrator = target_user.groups.filter(
            pk=administrator_group.pk,
        ).exists()

        administrator_role_requested = (
            ADMINISTRATOR_GROUP in requested_role_names
        )

        removing_administrator_role = (
            target_is_administrator
            and not administrator_role_requested
        )

        if (
            actor.pk == target_user.pk
            and removing_administrator_role
        ):
            raise SelfAdministratorRemovalError(
                "Administrators cannot remove their own Administrator role."
            )

        if (
            target_user.is_active
            and removing_administrator_role
        ):
            cls._ensure_another_active_administrator_exists(
                excluded_user_id=target_user.pk,
                administrator_group=administrator_group,
            )

        application_groups = cls._get_all_application_groups(lock=True)

        target_user.groups.remove(*application_groups)

        if requested_groups:
            target_user.groups.add(*requested_groups)

        target_user._prefetched_objects_cache = {}

        return target_user

    @staticmethod
    def _get_locked_user(user_id):
        """
        Retrieve and lock a user row for the current transaction.
        """
        return User.objects.select_for_update().get(pk=user_id)

    @staticmethod
    def _get_locked_administrator_group():
        """
        Retrieve and lock the Administrator Group.

        Every operation capable of reducing active Administrator access locks
        this row. That serializes those operations and prevents two concurrent
        requests from both passing the last-Administrator check.
        """
        try:
            return Group.objects.select_for_update().get(
                name=ADMINISTRATOR_GROUP,
            )
        except Group.DoesNotExist as exc:
            raise ApplicationRoleConfigurationError(
                "The Administrator application role is not configured."
            ) from exc

    @classmethod
    def _get_application_role_groups(cls, role_names, *, lock):
        """
        Return Group objects for the requested application role names.

        Missing Groups indicate environment or data-migration configuration
        failure, not invalid client input.
        """
        normalized_role_names = set(role_names)

        unsupported_roles = (
            normalized_role_names - set(APPLICATION_GROUPS)
        )

        if unsupported_roles:
            unsupported_display = ", ".join(
                sorted(unsupported_roles)
            )
            raise ApplicationRoleConfigurationError(
                f"Unsupported application roles: {unsupported_display}."
            )

        if not normalized_role_names:
            return []

        queryset = Group.objects.filter(
            name__in=normalized_role_names,
        )

        if lock:
            queryset = queryset.select_for_update()

        groups_by_name = {
            group.name: group
            for group in queryset
        }

        missing_roles = (
            normalized_role_names - groups_by_name.keys()
        )

        if missing_roles:
            missing_display = ", ".join(
                sorted(missing_roles)
            )
            raise ApplicationRoleConfigurationError(
                f"Application roles are not configured: {missing_display}."
            )

        return [
            groups_by_name[role_name]
            for role_name in APPLICATION_GROUPS
            if role_name in normalized_role_names
        ]

    @classmethod
    def _get_all_application_groups(cls, *, lock):
        """
        Retrieve every configured application-managed Group.
        """
        return cls._get_application_role_groups(
            APPLICATION_GROUPS,
            lock=lock,
        )

    @staticmethod
    def _ensure_another_active_administrator_exists(
        *,
        excluded_user_id,
        administrator_group,
    ):
        """
        Ensure at least one other active Administrator remains.
        """
        another_active_administrator_exists = User.objects.filter(
            is_active=True,
            groups=administrator_group,
        ).exclude(
            pk=excluded_user_id,
        ).exists()

        if not another_active_administrator_exists:
            raise LastActiveAdministratorError(
                "The last active Administrator cannot be removed or "
                "deactivated."
            )