from django.contrib import admin, messages
from django.utils.text import slugify

from .models import Category


@admin.action(description="Mark selected categories as active")
def activate_categories(modeladmin, request, queryset):
    """
    Activate the selected categories.
    """
    updated_count = queryset.update(is_active=True)

    modeladmin.message_user(
        request,
        f"{updated_count} category(s) were successfully activated.",
        level=messages.SUCCESS,
    )


@admin.action(description="Mark selected categories as inactive")
def deactivate_categories(modeladmin, request, queryset):
    """
    Deactivate the selected categories.
    """
    updated_count = queryset.update(is_active=False)

    modeladmin.message_user(
        request,
        f"{updated_count} category(s) were successfully deactivated.",
        level=messages.SUCCESS,
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Admin configuration for Category.
    """

    list_display = (
        "name",
        "is_active",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "name",
        "slug",
    )

    list_filter = (
        "is_active",
        "created_at",
    )

    ordering = ("name",)

    readonly_fields = (
        "slug",
        "is_active",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
    )

    list_per_page = 15

    fieldsets = (
        (
            "Category Information",
            {
                "fields": (
                    "name",
                    "slug",
                ),
            },
        ),
        (
            "Status",
            {
                "fields": ("is_active",),
            },
        ),
        (
            "Audit Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                    "created_by",
                    "updated_by",
                ),
            },
        ),
    )

    actions = (
        activate_categories,
        deactivate_categories,
    )

    def get_queryset(self, request):
        return Category.all_objects.all()
    
    def save_model(self, request, obj, form, change):
        """
        Automatically populate audit fields when saving a category
        through the Django admin.
        """
        if not change:
            obj.created_by = request.user
            obj.slug = slugify(obj.name)

        obj.updated_by = request.user

        super().save_model(request, obj, form, change)
