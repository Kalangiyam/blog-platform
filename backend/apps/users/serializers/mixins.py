from apps.users.constants import APPLICATION_GROUPS


class ApplicationRoleListMixin:
    """
    Provide consistent application-role serialization.

    Only application-managed Groups are exposed. Unrelated Django Groups
    remain private and are not included in API responses.
    """

    def get_roles(self, obj):
        """
        Return application role names assigned to the user.
        """
        assigned_roles = {
            group.name
            for group in obj.groups.all()
        }

        return [
            role_name
            for role_name in APPLICATION_GROUPS
            if role_name in assigned_roles
        ]
