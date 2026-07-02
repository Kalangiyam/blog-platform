from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.managers import SoftDeleteManager


class SoftDeleteModel(models.Model):
    """
    Abstract base model that provides
    soft deletion support.
    """

    is_deleted = models.BooleanField(
        default=False, help_text="Indicates whether this record has been soft deleted."
    )

    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="The date and time when this record was soft deleted.",
    )

    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deleted_%(class)ss",
        help_text="The user who soft deleted this record.",
    )

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False, *,  user=None):
        """
        Soft delete the current instance.
        """
        if self.is_deleted:
            return

        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])

    def restore(self, *,  user=None):
        """
        Restore a previously soft deleted instance.
        """
        if not self.is_deleted:
            return
        
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])

    def hard_delete(self, using=None, keep_parents=False):
        """
        Permanently delete the instance from the database.
        """
        super().delete(using=using, keep_parents=keep_parents)