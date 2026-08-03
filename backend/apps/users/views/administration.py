from django.contrib.auth import get_user_model
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.core.permissions import IsAdministrator
from apps.users.pagination import UserAdministrationPagination
from apps.users.serializers import (
    AdminUserCreateSerializer,
    AdminUserDetailSerializer,
    AdminUserListSerializer,
    UserActivationSerializer,
    UserDeactivationSerializer,
    UserRoleUpdateSerializer,
)

User = get_user_model()


class UserAdministrationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet,
):
    """
    Provide Administrator-only user lifecycle management.

    Supported operations:

    - Create users
    - List users
    - Retrieve user details
    - Activate users
    - Deactivate users
    - Replace application-managed roles

    General user updates and user deletion are intentionally not exposed.
    """

    permission_classes = [IsAdministrator]
    pagination_class = UserAdministrationPagination
    lookup_field = "pk"

    def get_queryset(self):
        """
        Return users with Group memberships prefetched.

        Prefetching prevents one additional Group query per user when
        serializers produce application-role responses.
        """
        return User.objects.prefetch_related(
            "groups",
        ).order_by(
            "-date_joined",
            "-pk",
        )

    def get_serializer_class(self):
        """
        Select a serializer based on the active ViewSet action.
        """
        serializer_classes = {
            "create": AdminUserCreateSerializer,
            "list": AdminUserListSerializer,
            "retrieve": AdminUserDetailSerializer,
            "activate": UserActivationSerializer,
            "deactivate": UserDeactivationSerializer,
            "roles": UserRoleUpdateSerializer,
        }

        try:
            return serializer_classes[self.action]
        except KeyError as exc:
            raise AssertionError(
                f"No serializer configured for action '{self.action}'."
            ) from exc

    @action(
        detail=True,
        methods=["post"],
        url_path="activate",
    )
    def activate(self, request, *args, **kwargs):
        """
        Activate the selected user.

        The request body must be empty. The operation is idempotent.
        """
        target_user = self.get_object()

        serializer = self.get_serializer(
            instance=target_user,
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()

        response_serializer = AdminUserDetailSerializer(
            updated_user,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="deactivate",
    )
    def deactivate(self, request, *args, **kwargs):
        """
        Deactivate the selected user.

        The service layer prevents self-deactivation and protects the final
        active Administrator account.
        """
        target_user = self.get_object()

        serializer = self.get_serializer(
            instance=target_user,
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()

        response_serializer = AdminUserDetailSerializer(
            updated_user,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["put"],
        url_path="roles",
    )
    def roles(self, request, *args, **kwargs):
        """
        Replace the selected user's complete application-role collection.

        Unrelated Django Group memberships are preserved by the service layer.
        """
        target_user = self.get_object()

        serializer = self.get_serializer(
            instance=target_user,
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()

        response_serializer = AdminUserDetailSerializer(
            updated_user,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )