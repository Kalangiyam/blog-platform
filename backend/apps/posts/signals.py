from django.db import transaction
from django.db.models.signals import post_delete
from django.dispatch import receiver

from apps.posts.models import Post


@receiver(post_delete, sender=Post)
def delete_post_featured_image_after_physical_delete(
    sender,
    instance,
    **kwargs,
):
    """
    Delete a Post featured image after the Post is physically deleted.

    Soft deletion does not trigger this signal because the database row is
    retained. The storage object is deleted only after the database
    transaction commits successfully.
    """

    if not instance.featured_image:
        return

    file_name = instance.featured_image.name
    storage = instance.featured_image.storage

    if not file_name:
        return

    transaction.on_commit(
        lambda: _delete_file(
            storage=storage,
            file_name=file_name,
        )
    )


def _delete_file(
    *,
    storage,
    file_name: str,
):
    """
    Delete a stored file when it exists.
    """

    if storage.exists(file_name):
        storage.delete(file_name)