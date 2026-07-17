from django.contrib import admin

from apps.profiles.models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """
    Provide administrative visibility into user profiles.

    Profile ownership is read-only because changing the linked user could
    transfer profile data from one account to another.
    """

    list_display = (
        "user",
        "location",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "user__username",
        "user__email",
        "location",
    )
    readonly_fields = (
        "user",
        "created_at",
        "updated_at",
    )
    list_select_related = ("user",)
    ordering = ("user__username",)

    fieldsets = (
        (
            "Profile Owner",
            {
                "fields": ("user",),
            },
        ),
        (
            "Public Profile Information",
            {
                "fields": (
                    "bio",
                    "website",
                    "location",
                ),
            },
        ),
        (
            "Personal Information",
            {
                "fields": ("date_of_birth",),
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )

    def has_delete_permission(self, request, obj=None):
        """
        Prevent admins from deleting a profile. 
        Profiles should only be deleted when the User is deleted.
        """
        return False

    def has_add_permission(self, request):
        """
        Prevent admins from manually creating standalone profiles.
        Profiles must only be created automatically via signals.
        """
        return False