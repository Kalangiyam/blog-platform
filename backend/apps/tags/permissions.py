from rest_framework.permissions import BasePermission


class IsTagManager(BasePermission):
    """
    Allows access only to users who can manage tags.
    """

    message = "You do not have permission to manage tags."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )