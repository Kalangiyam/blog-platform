POST_SEARCH_CONFIG = "english"


# Featured-image upload limits

MAX_FEATURED_IMAGE_SIZE = 5 * 1024 * 1024
MAX_FEATURED_IMAGE_WIDTH = 8_000
MAX_FEATURED_IMAGE_HEIGHT = 8_000
MAX_FEATURED_IMAGE_PIXELS = 40_000_000


# Supported featured-image file types

ALLOWED_FEATURED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

ALLOWED_FEATURED_IMAGE_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

ALLOWED_FEATURED_IMAGE_FORMATS = {
    "JPEG",
    "PNG",
    "WEBP",
}


FEATURED_IMAGE_FORMAT_EXTENSIONS = {
    "JPEG": {".jpg", ".jpeg"},
    "PNG": {".png"},
    "WEBP": {".webp"},
}

FEATURED_IMAGE_FORMAT_MIME_TYPES = {
    "JPEG": {"image/jpeg"},
    "PNG": {"image/png"},
    "WEBP": {"image/webp"},
}