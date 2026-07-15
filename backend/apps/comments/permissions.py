from rest_framework.permissions import BasePermission


class IsCommentAuthor(BasePermission):
    """
    Allow access only to the author of the Comment.
    """

    message = "You do not have permission to modify this comment."

    def has_object_permission(self, request, view, obj):
        return obj.author_id == request.user.id