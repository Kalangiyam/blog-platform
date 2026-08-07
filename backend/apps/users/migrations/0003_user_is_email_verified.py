from django.db import migrations, models


def mark_existing_users_verified(apps, schema_editor):
    User = apps.get_model("users", "User")
    User.objects.all().update(is_email_verified=True)


def unmark_existing_users_verified(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_create_application_groups"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_email_verified",
            field=models.BooleanField(
                default=False,
                help_text="Designates whether the user's email address is verified.",
                verbose_name="Email Verified Status",
            ),
        ),
        migrations.RunPython(
            mark_existing_users_verified,
            reverse_code=unmark_existing_users_verified,
        ),
    ]
