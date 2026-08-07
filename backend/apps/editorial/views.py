from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.categories.models import Category
from apps.comments.models import Comment
from apps.core.pagination import StandardPageNumberPagination
from apps.core.permissions import IsAuthor, IsEditor
from apps.editorial.serializers import (
    CategoryManagementSerializer,
    CommentModerationListSerializer,
    EditorialPostFilterSerializer,
    EditorialPostListSerializer,
    TagManagementSerializer,
)
from apps.posts.models import Post
from apps.posts.serializers import PostDetailSerializer
from apps.tags.models import Tag
from apps.users.constants import EDITOR_GROUP


class EditorialPostViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Editorial Post Management collection and restoration endpoint (/api/editorial/posts/).
    """

    pagination_class = StandardPageNumberPagination
    lookup_field = "slug"

    def get_permissions(self):
        if self.action == "restore":
            permission_classes = (IsAuthenticated, IsEditor)
        else:
            permission_classes = (IsAuthenticated, IsAuthor | IsEditor)
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == "restore":
            return PostDetailSerializer
        return EditorialPostListSerializer

    def get_queryset(self):
        user = self.request.user
        is_editor = user.groups.filter(name=EDITOR_GROUP).exists()

        if is_editor:
            qs = Post.objects.with_deleted().select_related("author").prefetch_related("categories", "tags")
        else:
            qs = Post.objects.with_deleted().filter(author=user).select_related("author").prefetch_related("categories", "tags")

        filter_serializer = EditorialPostFilterSerializer(data=self.request.query_params)
        filter_serializer.is_valid(raise_exception=True)
        validated_params = filter_serializer.validated_data

        status_param = validated_params.get("status")
        is_deleted_param = validated_params.get("is_deleted")

        if status_param:
            qs = qs.filter(status=status_param)

        if is_deleted_param is True:
            qs = qs.filter(is_deleted=True)
        elif is_deleted_param is False:
            qs = qs.filter(is_deleted=False)

        return qs.order_by("-created_at", "-pk")

    @action(detail=True, methods=["post"])
    def restore(self, request, *args, **kwargs):
        """
        Restore a soft-deleted post. Accessible to Editors only.
        """
        post = self.get_object()
        if post.is_deleted:
            post.restore()

        response_serializer = PostDetailSerializer(
            post,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )


class EditorialCategoryViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Editorial Category Management endpoint (/api/editorial/categories/). Exposes active and inactive categories for Editors.
    """

    pagination_class = StandardPageNumberPagination
    permission_classes = (IsAuthenticated, IsEditor)
    lookup_field = "slug"
    serializer_class = CategoryManagementSerializer

    def get_queryset(self):
        return Category.all_objects.all().order_by("name")

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        serializer.save(
            updated_by=self.request.user,
        )


class EditorialTagViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Editorial Tag Management endpoint (/api/editorial/tags/). Exposes active and inactive tags for Editors.
    """

    pagination_class = StandardPageNumberPagination
    permission_classes = (IsAuthenticated, IsEditor)
    lookup_field = "slug"
    serializer_class = TagManagementSerializer

    def get_queryset(self):
        return Tag.all_objects.all().order_by("name")

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

    def perform_update(self, serializer):
        serializer.save(
            updated_by=self.request.user,
        )


class EditorialCommentViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Editorial Comment Moderation collection endpoint (/api/editorial/comments/).
    """

    pagination_class = StandardPageNumberPagination
    permission_classes = (IsAuthenticated, IsEditor)
    serializer_class = CommentModerationListSerializer

    def get_queryset(self):
        qs = Comment.objects.with_deleted().select_related("author", "post")
        is_deleted_param = self.request.query_params.get("is_deleted")
        if is_deleted_param == "true":
            qs = qs.filter(is_deleted=True)
        elif is_deleted_param == "false":
            qs = qs.filter(is_deleted=False)

        return qs.order_by("-created_at", "-pk")

    @action(detail=True, methods=["post"])
    def restore(self, request, *args, **kwargs):
        """
        Restore a soft-deleted comment. Reject if parent post is soft-deleted.
        """
        comment = self.get_object()
        if comment.post.is_deleted:
            raise ValidationError(
                {"post": ["Cannot restore comment on a soft-deleted post."]}
            )

        if comment.is_deleted:
            comment.restore()

        response_serializer = CommentModerationListSerializer(
            comment,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )
