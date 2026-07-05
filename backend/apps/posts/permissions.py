from rest_framework.permissions import BasePermission


class IsPostAuthor(BasePermission):
    """
    Allow access only to the author of the post.
    """

    message = "You do not have permission to modify this post."

    def has_object_permission(self, request, view, obj):
        """
        Return True only if the authenticated user owns the post.
        """

        return obj.author == request.user