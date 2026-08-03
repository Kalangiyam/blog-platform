from rest_framework import mixins, viewsets

from .models import Tag
from apps.core.permissions import IsEditorOrReadOnly
from .serializers import (
    TagCreateSerializer,
    TagReadSerializer,
    TagUpdateSerializer,
)
from apps.core.pagination import StandardPageNumberPagination


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
    pagination_class = StandardPageNumberPagination
    queryset = Tag.objects.all()
    permission_classes = [IsEditorOrReadOnly]
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