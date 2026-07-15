from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response



from apps.comments.models import Comment
from apps.comments.permissions import IsCommentAuthor
from apps.comments.serializers import (
    CommentCreateSerializer,
    CommentListSerializer,
    CommentUpdateSerializer,
)
from apps.posts.models import Post
from apps.posts.choices import PostStatus


class PostCommentViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """
    List and create comments belonging to a published post.
    """

    serializer_class = CommentListSerializer

    def get_permissions(self):
        """
        Allow public comment listing but require authentication
        when creating a comment.
        """
        if self.action == "create":
            permission_classes = (IsAuthenticated,)
        else:
            permission_classes = (AllowAny,)

        return [permission() for permission in permission_classes]

    def get_post(self):
        """
        Return the published, non-deleted post identified by the URL slug.

        Using the normal Post manager should automatically exclude
        soft-deleted posts.
        """
        return get_object_or_404(
            Post.objects.all(),
            slug=self.kwargs["post_slug"],
            status=PostStatus.PUBLISHED,
        )

    def get_queryset(self):
        """
        Return visible comments belonging to the current published post.

        select_related avoids an additional query for each author.
        """
        post = self.get_post()

        return Comment.objects.filter(post=post).select_related("author")

    def get_serializer_class(self):
        """
        Select the serializer that matches the current action.
        """
        if self.action == "create":
            return CommentCreateSerializer

        return CommentListSerializer

    def perform_create(self, serializer):
        """
        Create the comment using backend-controlled relationship
        and audit values.
        """
        user = self.request.user
        post = self.get_post()

        serializer.save(
            post=post,
            author=user,
            created_by=user,
            updated_by=user,
        )

    def create(self, request, *args, **kwargs):
        """
        Create a comment and return the public Comment representation.
        """
        create_serializer = self.get_serializer(
            data=request.data,
        )
        create_serializer.is_valid(raise_exception=True)

        self.perform_create(create_serializer)

        response_serializer = CommentListSerializer(
            create_serializer.instance,
            context=self.get_serializer_context(),
        )

        headers = self.get_success_headers(
            response_serializer.data,
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class CommentViewSet(
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    Update and soft delete individual comments.
    """

    queryset = Comment.objects.select_related(
        "author",
        "post",
    )

    serializer_class = CommentUpdateSerializer

    permission_classes = (
        IsAuthenticated,
        IsCommentAuthor,
    )

    http_method_names = (
        "patch",
        "delete",
        "head",
        "options",
    )

    def perform_update(self, serializer):
        """
        Update Comment content and maintain the audit trail.
        """
        serializer.save(
            updated_by=self.request.user,
        )

    def partial_update(self, request, *args, **kwargs):
        """
        Partially update the Comment and return its public representation.
        """
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        response_serializer = CommentListSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK,
        )

    def perform_destroy(self, instance):
        """
        Soft delete the Comment through shared model lifecycle logic.
        """
        instance.delete(user=self.request.user)