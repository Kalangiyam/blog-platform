from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from .models import Category
from .permissions import IsCategoryManager
from .serializers import (
    CategoryCreateSerializer,
    CategoryReadSerializer,
    CategoryUpdateSerializer,
)


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

    queryset = Category.objects.all()
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
    
    def get_permissions(self):
        """
        Return permission classes based on the current action.
        """

        if self.action in ("list", "retrieve"):
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsCategoryManager]

        return [permission() for permission in permission_classes]
    
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