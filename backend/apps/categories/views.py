from rest_framework import mixins, viewsets

from .models import Category
from apps.core.permissions import IsEditorOrReadOnly
from .serializers import (
    CategoryCreateSerializer,
    CategoryReadSerializer,
    CategoryUpdateSerializer,
)
from apps.core.pagination import StandardPageNumberPagination

class CategoryViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoints for managing categories.
    """

    pagination_class = StandardPageNumberPagination
    queryset = Category.objects.all()
    permission_classes = [IsEditorOrReadOnly]
    lookup_field = "slug"

    def get_serializer_class(self):
        """
        Return the serializer class based on the current action.
        """

        if self.action == "create":
            return CategoryCreateSerializer

        if self.action in ["update", "partial_update"]:
            return CategoryUpdateSerializer

        return CategoryReadSerializer
    
    def perform_create(self, serializer):
        """
        Save the category with audit information.
        """
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        """
        Save the updated category with audit information.
        """
        serializer.save(
            updated_by=self.request.user,
        )