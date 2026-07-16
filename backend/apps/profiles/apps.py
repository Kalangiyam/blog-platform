from django.apps import AppConfig


class ProfilesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.profiles"
    verbose_name = "Profiles"

    def ready(self):
        """
        Import signal receivers when Django finishes loading the app registry.
        """
        from apps.profiles import signals  # noqa: F401