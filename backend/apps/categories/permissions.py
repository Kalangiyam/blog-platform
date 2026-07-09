from rest_framework.permissions import BasePermission


class IsCategoryManager(BasePermission):
    """
    Allows access only to users who can manage categories.
    """

    message = "You do not have permission to manage categories."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )