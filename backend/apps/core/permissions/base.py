from rest_framework.permissions import SAFE_METHODS, BasePermission


class ReadOnly(BasePermission):
    """
    Allow only HTTP methods that do not modify server-side data.

    Safe methods include GET, HEAD, and OPTIONS.
    """

    message = "Only read-only access is allowed."

    def has_permission(self, request, view):
        """
        Return True when the request uses a safe HTTP method.
        """
        return request.method in SAFE_METHODS