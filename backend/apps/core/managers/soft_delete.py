from django.db import models
from django.utils import timezone


class SoftDeleteQuerySet(models.QuerySet):
    """
    QuerySet providing reusable soft delete operations.
    """

    def active(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)

    def with_deleted(self):
        return self.all()

    def soft_delete(self):
        return self.update(
            is_deleted=True,
            deleted_at=timezone.now(),
        )

    def restore(self):
        return self.update(
            is_deleted=False,
            deleted_at=None,
            deleted_by=None,
        )
    
class SoftDeleteManager(models.Manager):
    """
    Default manager that hides soft deleted records.
    """

    def get_queryset(self):
        return SoftDeleteQuerySet(
            self.model,
            using=self._db,
        ).active()

    def with_deleted(self):
        return SoftDeleteQuerySet(
            self.model,
            using=self._db,
        )

    def deleted(self):
        return self.with_deleted().deleted()