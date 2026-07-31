from apps.core.permissions.base import ReadOnly
from apps.core.permissions.ownership import IsOwner
from apps.core.permissions.roles import (
    IsAdministrator,
    IsEditor,
    IsEditorOrReadOnly,
    IsInGroup,
    IsAuthor,
)

__all__ = [
    "IsAdministrator",
    "IsEditor",
    "IsEditorOrReadOnly",
    "IsInGroup",
    "IsOwner",    
    "IsAuthor",
    "ReadOnly",
]