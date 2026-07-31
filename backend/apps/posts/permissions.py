from rest_framework.permissions import BasePermission

from apps.users.constants import EDITOR_GROUP


class IsPostAuthor(BasePermission):
    """
    Object-level permission for managing posts.

    Editors may manage any post.

    Authors may manage only their own posts.
    """

    message = "You do not have permission to modify this post."

    def has_object_permission(self, request, view, obj):
        """
        Return True when the user is an Editor or owns the post.
        """

        if request.user.groups.filter(
            name=EDITOR_GROUP,
        ).exists():
            return True

        return obj.author == request.user