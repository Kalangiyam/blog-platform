from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from .models import Tag
from .permissions import IsTagManager
from .serializers import (
    TagCreateSerializer,
    TagReadSerializer,
    TagUpdateSerializer,
)


class TagViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoints for managing tags.
    """

    queryset = Tag.objects.all()
    lookup_field = "slug"

    def get_serializer_class(self):
        """
        Return the serializer class based on the current action.
        """

        if self.action == "create":
            return TagCreateSerializer

        if self.action in ("update", "partial_update"):
            return TagUpdateSerializer

        return TagReadSerializer

    def get_permissions(self):
        """
        Return permission classes based on the current action.
        """

        if self.action in ("list", "retrieve"):
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsTagManager]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Save the tag with audit information.
        """
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        """
        Save the updated tag with audit information.
        """
        serializer.save(
            updated_by=self.request.user,
        )