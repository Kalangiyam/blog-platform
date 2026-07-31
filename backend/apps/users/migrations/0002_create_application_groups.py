from django.db import migrations


APPLICATION_GROUPS = (
    "Author",
    "Editor",
    "Administrator",
)


def create_application_groups(apps, schema_editor):
    """
    Create the application's standard authorization groups.

    get_or_create keeps the migration safe when a group already exists.
    """
    Group = apps.get_model("auth", "Group")

    for group_name in APPLICATION_GROUPS:
        Group.objects.get_or_create(name=group_name)


def remove_application_groups(apps, schema_editor):
    """
    Remove the application groups when this migration is reversed.
    """
    Group = apps.get_model("auth", "Group")

    Group.objects.filter(name__in=APPLICATION_GROUPS).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RunPython(
            create_application_groups,
            remove_application_groups,
        ),
    ]