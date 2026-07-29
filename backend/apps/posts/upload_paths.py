from pathlib import Path
from uuid import uuid4

from django.utils import timezone

from apps.posts.constants import FEATURED_IMAGE_FORMAT_EXTENSIONS


def post_featured_image_upload_path(instance, filename: str) -> str:
    """
    Generate a safe storage-relative path for a Post featured image.

    The original filename is not preserved. Only its normalized extension is
    used, while a UUID provides a collision-resistant stored filename.
    """

    original_extension = Path(filename).suffix.lower()

    normalized_extension = _normalize_featured_image_extension(
        original_extension
    )

    current_date = timezone.now()

    generated_filename = f"{uuid4()}{normalized_extension}"

    return (
        f"posts/featured/"
        f"{current_date:%Y}/"
        f"{current_date:%m}/"
        f"{generated_filename}"
    )


def _normalize_featured_image_extension(extension: str) -> str:
    """
    Normalize a supported featured-image extension.

    JPEG files always use the shorter `.jpg` extension in storage.
    """

    if extension in FEATURED_IMAGE_FORMAT_EXTENSIONS["JPEG"]:
        return ".jpg"

    if extension in FEATURED_IMAGE_FORMAT_EXTENSIONS["PNG"]:
        return ".png"

    if extension in FEATURED_IMAGE_FORMAT_EXTENSIONS["WEBP"]:
        return ".webp"

    raise ValueError("Unsupported featured-image extension.")