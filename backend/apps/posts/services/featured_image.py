from django.db import transaction


def replace_post_featured_image(
    *,
    post,
    uploaded_file,
    updated_by,
):
    """
    Replace the Post's current featured image.

    The new file is assigned and the Post is saved inside a database
    transaction. The previous file is deleted only after the transaction
    commits successfully.

    Args:
        post:
            Post instance whose featured image is being replaced.

        uploaded_file:
            Previously validated uploaded-file object.

        updated_by:
            Authenticated user performing the operation.

    Returns:
        The updated Post instance.
    """

    previous_file_name = _get_file_name(post.featured_image)

    post.featured_image = uploaded_file
    post.updated_by = updated_by

    try:
        with transaction.atomic():
            post.save(
                update_fields=(
                    "featured_image",
                    "updated_by",
                    "updated_at",
                )
            )

            new_file_name = _get_file_name(post.featured_image)

            transaction.on_commit(
                lambda: _delete_replaced_file(
                    storage=post.featured_image.storage,
                    previous_file_name=previous_file_name,
                    new_file_name=new_file_name,
                )
            )

    except Exception:
        try:
            _delete_current_file_if_unreferenced(
                post=post,
                previous_file_name=previous_file_name,
            )
        except Exception:
            # Preserve the original failure.
            # Add structured logging when project logging is introduced.
            pass

        raise
    
    return post


def remove_post_featured_image(
    *,
    post,
    updated_by,
):
    """
    Remove the Post's featured image safely.

    The database reference is cleared first. The physical storage object is
    deleted only after the database transaction commits.
    """

    previous_file_name = _get_file_name(post.featured_image)

    if not previous_file_name:
        return post

    storage = post.featured_image.storage

    post.featured_image = None
    post.updated_by = updated_by

    with transaction.atomic():
        post.save(
            update_fields=(
                "featured_image",
                "updated_by",
                "updated_at",
            )
        )

        transaction.on_commit(
            lambda: _delete_file(
                storage=storage,
                file_name=previous_file_name,
            )
        )

    return post


def _get_file_name(field_file) -> str:
    """
    Return a stored file name or an empty string.
    """

    if not field_file:
        return ""

    return field_file.name or ""


def _delete_replaced_file(
    *,
    storage,
    previous_file_name: str,
    new_file_name: str,
):
    """
    Delete the previous file after a successful replacement.

    The old file is retained when no previous file existed or when the storage
    backend resolved both references to the same name.
    """

    if not previous_file_name:
        return

    if previous_file_name == new_file_name:
        return

    _delete_file(
        storage=storage,
        file_name=previous_file_name,
    )


def _delete_current_file_if_unreferenced(
    *,
    post,
    previous_file_name: str,
):
    """
    Best-effort cleanup if saving the new database reference fails.

    If a new file was written to storage before the database operation failed,
    delete that new file while preserving the previous file.
    """

    current_file_name = _get_file_name(post.featured_image)

    if not current_file_name:
        return

    if current_file_name == previous_file_name:
        return

    _delete_file(
        storage=post.featured_image.storage,
        file_name=current_file_name,
    )


def _delete_file(
    *,
    storage,
    file_name: str,
):
    """
    Delete a storage object when it exists.

    Storage deletion is treated as best-effort cleanup. Failure should be
    logged later through the project's logging architecture.
    """

    if not file_name:
        return

    if storage.exists(file_name):
        storage.delete(file_name)