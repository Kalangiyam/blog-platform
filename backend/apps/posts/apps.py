from django.apps import AppConfig


class PostsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.posts"

    def ready(self):
        """
        Register Posts-domain signal handlers.
        """

        from apps.posts import signals  # noqa: F401
