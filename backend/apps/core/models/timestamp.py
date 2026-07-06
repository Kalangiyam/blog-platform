from django.db import models


class TimeStampedModel(models.Model):
    """
    Abstract base model that automatically tracks
    when a record is created and last updated.
    """

    created_at = models.DateTimeField(
        auto_now_add=True, help_text="The date and time when this record was created."
    )
    updated_at = models.DateTimeField(
        auto_now=True, help_text="The date and time when this record was last updated."
    )

    class Meta:
        abstract = True
