
from .base import *


DEBUG = env.bool("DEBUG",default=True)

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

MEDIA_ROOT = BASE_DIR / "media"
