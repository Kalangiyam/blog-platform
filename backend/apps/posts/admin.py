from django.contrib import admin

from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Post model.
    """

    list_display = (
        "title",
        "author",
        "status",
        "published_at",
        "created_at",
    )

    list_filter = (
        "status",
        "author",
        "created_at",
    )

    search_fields = (
        "title",
        "slug",
        "content",
    )

    ordering = (
        "-published_at",
        "-created_at",
    )

    prepopulated_fields = {
        "slug": ("title",),
    }

    readonly_fields = (
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
        "deleted_at",
        "deleted_by",
    )
