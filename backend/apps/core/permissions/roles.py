from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.users.constants import (
    ADMINISTRATOR_GROUP,
    EDITOR_GROUP,
    AUTHOR_GROUP,
)


class IsInGroup(BasePermission):
    """
    Base permission for checking membership in a configured Django group.

    Subclasses must provide the `required_group` attribute.
    """

    required_group = None
    message = "You do not have the required role to perform this action."

    def has_permission(self, request, view):
        """
        Allow access when the authenticated user belongs to the required group.
        """
        if not request.user.is_authenticated:
            return False

        if self.required_group is None:
            return False

        return request.user.groups.filter(
            name=self.required_group,
        ).exists()


class IsAuthor(IsInGroup):
    """
    Allow access only to users assigned to the Writer group.
    """

    required_group = AUTHOR_GROUP
    message = "Only Author can perform this action."


class IsEditor(IsInGroup):
    """
    Allow access only to users assigned to the Editor group.
    """

    required_group = EDITOR_GROUP
    message = "Only Editors can perform this action."

class IsEditorOrReadOnly(BasePermission):
    """
    Allow public read access and restrict write access to Editors.

    Administrator and Django staff status do not automatically grant
    permission unless the user also belongs to the Editor group.
    """

    message = "Only Editors can modify this resource."

    def has_permission(self, request, view):
        """
        Allow safe methods publicly and require the Editor role for writes.
        """
        if request.method in SAFE_METHODS:
            return True

        if not request.user.is_authenticated:
            return False

        return request.user.groups.filter(
            name=EDITOR_GROUP,
        ).exists()
    
class IsAdministrator(IsInGroup):
    """
    Allow access only to users assigned to the Administrator group.
    """

    required_group = ADMINISTRATOR_GROUP
    message = "Only Administrators can perform this action."
