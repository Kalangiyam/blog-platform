from django.conf import settings
from django.db import migrations


def create_profiles_for_existing_users(apps, schema_editor):
    """
    Create missing Profile rows for users that existed before the
    automatic profile-creation signal was introduced.
    """
    User = apps.get_model(settings.AUTH_USER_MODEL)
    Profile = apps.get_model("profiles", "Profile")

    existing_profile_user_ids = Profile.objects.values_list(
        "user_id",
        flat=True,
    )

    missing_profiles = [
        Profile(user_id=user_id)
        for user_id in User.objects.exclude(
            id__in=existing_profile_user_ids,
        ).values_list("id", flat=True)
    ]

    Profile.objects.bulk_create(missing_profiles)


def remove_backfilled_profiles(apps, schema_editor):
    """
    Keep the reverse migration non-destructive.

    Profiles may contain user-entered data after this migration is applied,
    so reversing should not delete them.
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("profiles", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            create_profiles_for_existing_users,
            remove_backfilled_profiles,
        ),
    ]