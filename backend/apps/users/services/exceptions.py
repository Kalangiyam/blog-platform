class UserAdministrationError(Exception):
    """
    Base exception for user-administration business-rule failures.

    The code attribute allows the API layer to translate the exception into
    an appropriate HTTP response without parsing the message.
    """

    default_code = "user_administration_error"

    def __init__(self, message, *, code=None):
        super().__init__(message)
        self.message = message
        self.code = code or self.default_code


class ApplicationRoleConfigurationError(UserAdministrationError):
    """
    Raised when an expected application Group does not exist.
    """

    default_code = "application_role_configuration_error"


class SelfDeactivationError(UserAdministrationError):
    """
    Raised when an Administrator attempts to deactivate their own account.
    """

    default_code = "self_deactivation_not_allowed"


class SelfAdministratorRemovalError(UserAdministrationError):
    """
    Raised when an Administrator attempts to remove their own role.
    """

    default_code = "self_administrator_removal_not_allowed"


class LastActiveAdministratorError(UserAdministrationError):
    """
    Raised when an operation would leave no active Administrator.
    """

    default_code = "last_active_administrator"