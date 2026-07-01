from django.db import models


class ActiveStatusModel(models.Model):
    """
    Abstract base model that provides
    an active/inactive status for reference data.
    """

    is_active = models.BooleanField(
        default=True,
        help_text="Indicates whether this record is active."
    )

    class Meta:
        abstract = True