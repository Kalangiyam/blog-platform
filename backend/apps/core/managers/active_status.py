from django.db import models


class ActiveStatusQuerySet(models.QuerySet):
    """
    QuerySet providing reusable active status operations.
    """

    def active(self):
        return self.filter(is_active=True)

    def inactive(self):
        return self.filter(is_active=False)


class ActiveStatusManager(models.Manager):
    """
    Default manager that returns only active records by default.
    """
    def get_queryset(self):
        return ActiveStatusQuerySet(
            self.model,
            using=self._db,
        ).active()