from django.urls import path

from apps.comments.views import (
    CommentViewSet,
    PostCommentViewSet,
)


app_name = "comments"


post_comment_list_create = PostCommentViewSet.as_view(
    {
        "get": "list",
        "post": "create",
    }
)

comment_update_delete = CommentViewSet.as_view(
    {
        "patch": "partial_update",
        "delete": "destroy",
    }
)


urlpatterns = [
    path(
        "posts/<slug:post_slug>/comments/",
        post_comment_list_create,
        name="post-comment-list-create",
    ),
    path(
        "comments/<int:pk>/",
        comment_update_delete,
        name="comment-update-delete",
    ),
]