from django.contrib import admin

from ..models import Post
from .action import (
    soft_delete_posts,
    restore_posts,
    publish_posts,
    draft_posts
)


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
        "is_deleted",        
    )

    list_filter = (
        "status",
        "author",
        "created_at",
        "is_deleted",
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
        "is_deleted",
        "deleted_at",
        "deleted_by",
        # "featured_image"
    )

    fieldsets = (
        (
            "Content",
            {
                "fields": (
                    "title",
                    "slug",
                    "excerpt",
                    "content",
                    "featured_image"
                ),
            },
        ),
        (
            "Publication",
            {
                "fields": (
                    "status",
                    "published_at",
                ),
            },
        ),
        (
            "Ownership",
            {
                "fields": ("author",),
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
        (
            "Soft Delete",
            {
                "fields": (
                    "is_deleted",
                    "deleted_at",
                    "deleted_by",
                ),
            },
        ),
    )

    actions = (
        soft_delete_posts,
        draft_posts,
        publish_posts,
        restore_posts
    )

    def get_queryset(self, request):
        return Post.all_objects.all()

    def save_model(self, request, obj, form, change):
        """
        Automatically populate audit fields when saving a post
        through the Django admin.
        """
        if not change:
            obj.created_by = request.user

        obj.updated_by = request.user

        super().save_model(request, obj, form, change)