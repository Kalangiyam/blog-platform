from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Allow access only when the requested object belongs to the current user.

    The protected object must expose an `owner` attribute.
    """

    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        """
        Return True when the object's owner is the authenticated user.
        """
        return (
            request.user.is_authenticated
            and obj.owner == request.user
        )