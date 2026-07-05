from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, mixins, viewsets
from rest_framework.response import Response

from apps.posts.models import Post
from apps.posts.choices import PostStatus
from apps.posts.serializers import (
    PostCreateSerializer,
    PostDetailSerializer,
    PostListSerializer,
)


class PostViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for Post APIs.

    Currently supports:
    - Create Post
    - List Post
    """

    serializer_class = PostCreateSerializer
    lookup_field = "slug"

    def get_queryset(self):
        """
        Return the queryset for the current action.
        """

        queryset = Post.objects.filter(
            status=PostStatus.PUBLISHED,
        ).select_related("author")

        return queryset

    def get_serializer_class(self):
        """
        Return the appropriate serializer for the current action.
        """

        if self.action == "create":
            return PostCreateSerializer

        if self.action == "list":
            return PostListSerializer

        if self.action == "retrieve":
            return PostDetailSerializer
        
        return PostDetailSerializer

    def get_permissions(self):
        """
        Return the permissions required for the current action.
        """

        if self.action in ("list","retrieve"):
            permission_classes = (AllowAny,)
        else:
            permission_classes = (IsAuthenticated,)

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """
        Create a post and return its detailed representation.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = serializer.save()

        response_serializer = PostDetailSerializer(
            post,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )
