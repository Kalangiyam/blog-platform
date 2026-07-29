import warnings
from pathlib import Path

from django.core.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError

from apps.posts.constants import (
    ALLOWED_FEATURED_IMAGE_EXTENSIONS,
    ALLOWED_FEATURED_IMAGE_FORMATS,
    ALLOWED_FEATURED_IMAGE_MIME_TYPES,
    FEATURED_IMAGE_FORMAT_EXTENSIONS,
    FEATURED_IMAGE_FORMAT_MIME_TYPES,
    MAX_FEATURED_IMAGE_HEIGHT,
    MAX_FEATURED_IMAGE_PIXELS,
    MAX_FEATURED_IMAGE_SIZE,
    MAX_FEATURED_IMAGE_WIDTH,
)


def validate_post_featured_image(uploaded_file):
    """
    Validate a Post featured image without depending on HTTP metadata.

    This validator is suitable for:

    - Post model field validation
    - Django Admin
    - Django ModelForms
    - Shell validation through model.full_clean()

    MIME type validation is intentionally excluded because stored FieldFile
    objects do not reliably retain the original HTTP content_type value.
    """

    return _validate_featured_image(
        uploaded_file,
        validate_mime_type=False,
    )


def validate_post_featured_image_upload(uploaded_file):
    """
    Validate an image received through an HTTP multipart upload.

    In addition to core image validation, this validator checks the
    client-declared MIME type and confirms that it matches the format detected
    by Pillow.
    """

    return _validate_featured_image(
        uploaded_file,
        validate_mime_type=True,
    )


def _validate_featured_image(
    uploaded_file,
    *,
    validate_mime_type: bool,
):
    """
    Run the shared featured-image validation pipeline.

    Args:
        uploaded_file:
            Django uploaded-file or file-like object.

        validate_mime_type:
            Whether HTTP content_type validation must be applied.

    Returns:
        The validated uploaded file.
    """

    _validate_file_presence(uploaded_file)
    _validate_file_size(uploaded_file)

    extension = _get_and_validate_extension(uploaded_file)

    declared_mime_type = None

    if validate_mime_type:
        declared_mime_type = _get_and_validate_mime_type(
            uploaded_file
        )

    try:
        image_format, width, height, is_animated = _inspect_image(
            uploaded_file
        )
    finally:
        _reset_file_pointer(uploaded_file)

    _validate_image_format(image_format)

    _validate_extension_matches_format(
        extension,
        image_format,
    )

    if validate_mime_type:
        _validate_mime_type_matches_format(
            declared_mime_type,
            image_format,
        )

    _validate_animation(is_animated)

    _validate_dimensions(
        width,
        height,
    )

    return uploaded_file


def _validate_file_presence(uploaded_file):
    """
    Ensure that the uploaded file exists and is not empty.
    """

    if uploaded_file is None:
        raise ValidationError("This field is required.")

    file_size = getattr(uploaded_file, "size", None)

    if file_size == 0:
        raise ValidationError(
            "The uploaded image is empty."
        )


def _validate_file_size(uploaded_file):
    """
    Enforce the maximum compressed upload size.
    """

    file_size = getattr(uploaded_file, "size", None)

    if (
        file_size is not None
        and file_size > MAX_FEATURED_IMAGE_SIZE
    ):
        raise ValidationError(
            "Image size must not exceed 5 MB."
        )


def _get_and_validate_extension(uploaded_file) -> str:
    """
    Return the lowercase filename extension after validating it.
    """

    filename = getattr(uploaded_file, "name", "")

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_FEATURED_IMAGE_EXTENSIONS:
        raise ValidationError(
            "Only JPEG, PNG, and WebP images are supported."
        )

    return extension


def _get_and_validate_mime_type(uploaded_file) -> str:
    """
    Return and validate the client-declared HTTP MIME type.
    """

    mime_type = getattr(
        uploaded_file,
        "content_type",
        None,
    )

    if mime_type not in ALLOWED_FEATURED_IMAGE_MIME_TYPES:
        raise ValidationError(
            "The uploaded file has an unsupported content type."
        )

    return mime_type


def _inspect_image(uploaded_file):
    """
    Verify and inspect the image using Pillow.

    The image is first opened and structurally verified. It is then reopened
    to read its format, dimensions, and animation status.
    """

    try:
        _reset_file_pointer(uploaded_file)

        with warnings.catch_warnings():
            warnings.simplefilter(
                "error",
                Image.DecompressionBombWarning,
            )

            with Image.open(uploaded_file) as image:
                image.verify()

        _reset_file_pointer(uploaded_file)

        with warnings.catch_warnings():
            warnings.simplefilter(
                "error",
                Image.DecompressionBombWarning,
            )

            with Image.open(uploaded_file) as image:
                image_format = image.format
                width, height = image.size

                is_animated = bool(
                    getattr(
                        image,
                        "is_animated",
                        False,
                    )
                )

        return (
            image_format,
            width,
            height,
            is_animated,
        )

    except (
        UnidentifiedImageError,
        OSError,
        SyntaxError,
        Image.DecompressionBombWarning,
        Image.DecompressionBombError,
    ) as exc:
        raise ValidationError(
            "Upload a valid, non-corrupted image."
        ) from exc


def _validate_image_format(image_format):
    """
    Ensure that Pillow detected a supported image format.
    """

    if image_format not in ALLOWED_FEATURED_IMAGE_FORMATS:
        raise ValidationError(
            "Only JPEG, PNG, and WebP images are supported."
        )


def _validate_extension_matches_format(
    extension: str,
    image_format: str,
):
    """
    Ensure that the filename extension matches the decoded image format.
    """

    valid_extensions = FEATURED_IMAGE_FORMAT_EXTENSIONS.get(
        image_format,
        set(),
    )

    if extension not in valid_extensions:
        raise ValidationError(
            "The image content does not match its file type."
        )


def _validate_mime_type_matches_format(
    mime_type: str,
    image_format: str,
):
    """
    Ensure that the declared MIME type matches the decoded image format.
    """

    valid_mime_types = FEATURED_IMAGE_FORMAT_MIME_TYPES.get(
        image_format,
        set(),
    )

    if mime_type not in valid_mime_types:
        raise ValidationError(
            "The image content does not match its content type."
        )


def _validate_animation(is_animated: bool):
    """
    Reject animated images.
    """

    if is_animated:
        raise ValidationError(
            "Animated images are not supported."
        )


def _validate_dimensions(
    width: int,
    height: int,
):
    """
    Enforce width, height, and total pixel-count limits.
    """

    if (
        width > MAX_FEATURED_IMAGE_WIDTH
        or height > MAX_FEATURED_IMAGE_HEIGHT
    ):
        raise ValidationError(
            "Image dimensions must not exceed "
            "8000 × 8000 pixels."
        )

    total_pixels = width * height

    if total_pixels > MAX_FEATURED_IMAGE_PIXELS:
        raise ValidationError(
            "The image resolution is too large."
        )


def _reset_file_pointer(uploaded_file):
    """
    Reset the file so later validation or storage starts at byte zero.
    """

    if hasattr(uploaded_file, "seek"):
        uploaded_file.seek(0)