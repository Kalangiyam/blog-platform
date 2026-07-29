from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics, status, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser

from apps.posts.models import Post
from apps.posts.permissions import IsPostAuthor
from apps.posts.pagination import PostSearchPagination
from apps.posts.serializers import (
    PostCreateSerializer,
    PostDetailSerializer,
    PostListSerializer,
    PostUpdateSerializer,
    PostSearchQuerySerializer,
    PostPublishSerializer,
    PostUnpublishSerializer,
    PostFeaturedImageResponseSerializer,
    PostFeaturedImageUploadSerializer,
)
from apps.posts.services.featured_image import (
    remove_post_featured_image,
    replace_post_featured_image,
)


class PostViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for Post APIs.

    Currently supports:
    - Create Post
    - List Post
    - Detail Post
    - Update Post
    - Delete Post
    - Publish Post
    - Unpublish Post
    """

    serializer_class = PostCreateSerializer
    lookup_field = "slug"

    def get_queryset(self):
        """
        Return the queryset for the current action.
        """

        if self.action in (
            "update",
            "partial_update",
            "destroy",
            "publish",
            "unpublish",
            "featured_image",
        ):
            return Post.objects.select_related("author").prefetch_related(
                "categories", "tags"
            )

        return (
            Post.objects.published()
            .select_related("author")
            .prefetch_related("categories", "tags")
        )

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

        if self.action == "publish":
            return PostPublishSerializer

        if self.action == "unpublish":
            return PostUnpublishSerializer

        if self.action == "featured_image":
            return PostFeaturedImageUploadSerializer

        return self.serializer_class

    def get_permissions(self):
        """
        Return the permissions required for the current action.
        """

        if self.action in ("list", "retrieve"):
            permission_classes = (AllowAny,)
        elif self.action in (
            "update",
            "partial_update",
            "destroy",
            "publish",
            "unpublish",
            "featured_image",
        ):
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

    def update(self, request, *args, **kwargs):
        """
        Update a post and return its detailed representation.
        """

        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        return Response(
            PostDetailSerializer(
                instance,
                context=self.get_serializer_context(),
            ).data
        )

    def get_object(self):
        """
        Retrieve the object and enforce object-level permissions.
        """

        obj = super().get_object()

        self.check_object_permissions(self.request, obj)

        return obj

    def perform_destroy(self, instance):
        """
        Soft delete the post.
        """

        instance.delete(user=self.request.user)

    @action(detail=True, methods=["post"])
    def publish(self, request, *args, **kwargs):
        post = self.get_object()

        serializer = self.get_serializer(
            instance=post,
            data={},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_serializer = PostDetailSerializer(
            post,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def unpublish(self, request, *args, **kwargs):
        post = self.get_object()

        serializer = self.get_serializer(
            instance=post,
            data={},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_serializer = PostDetailSerializer(
            post,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["put", "delete"],
        url_path="featured-image",
        parser_classes=(MultiPartParser, FormParser),
    )
    def featured_image(self, request, *args, **kwargs):
        """
        Upload, replace, or remove a Post featured image.

        PUT accepts a multipart image upload.
        DELETE removes the current featured image.
        """

        post = self.get_object()

        if request.method == "DELETE":
            remove_post_featured_image(
                post=post,
                updated_by=request.user,
            )

            return Response(
                status=status.HTTP_204_NO_CONTENT,
            )

        serializer = self.get_serializer(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        replace_post_featured_image(
            post=post,
            uploaded_file=serializer.validated_data["image"],
            updated_by=request.user,
        )

        response_serializer = PostFeaturedImageResponseSerializer(
            {
                "featured_image_url": self._build_featured_image_url(post),
            }
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )

    def _build_featured_image_url(self, post):
        """
        Return an absolute featured-image URL or None.
        """

        if not post.featured_image:
            return None

        return self.request.build_absolute_uri(post.featured_image.url)


class PostSearchAPIView(generics.ListAPIView):
    """
    Public API endpoint for searching published blog posts.
    """

    serializer_class = PostListSerializer
    permission_classes = (AllowAny,)
    pagination_class = PostSearchPagination

    def get_queryset(self):
        """
        Return published, non-deleted posts matching the validated query.
        """
        query_serializer = PostSearchQuerySerializer(
            data=self.request.query_params,
        )
        query_serializer.is_valid(raise_exception=True)

        query = query_serializer.validated_data["q"]

        return (
            Post.objects.published()
            .search(query)
            .select_related("author")
            .prefetch_related("categories", "tags")
        )
