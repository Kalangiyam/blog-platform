from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, mixins, viewsets
from rest_framework.response import Response

from apps.posts.models import Post
from apps.posts.choices import PostStatus
from apps.posts.permissions import IsPostAuthor
from apps.posts.serializers import (
    PostCreateSerializer,
    PostDetailSerializer,
    PostListSerializer,
    PostUpdateSerializer,
)


class PostViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for Post APIs.

    Currently supports:
    - Create Post
    - List Post
    - Detail Post
    - Update Post
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

        if self.action in ("update", "partial_update"):
            return PostUpdateSerializer

        return self.serializer_class

    def get_permissions(self):
        """
        Return the permissions required for the current action.
        """

        if self.action in ("list", "retrieve"):
            permission_classes = (AllowAny,)
        elif self.action in ("update", "partial_update"):
            permission_classes = (IsAuthenticated, IsPostAuthor)
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
    
    def get_object(self):
        """
        Retrieve the object and enforce object-level permissions.
        """

        obj = super().get_object()

        self.check_object_permissions(self.request, obj)

        return obj
