from django.contrib import admin, messages

from apps.comments.models import Comment

@admin.action(description="Soft delete selected comments")
def soft_delete_comments(modeladmin, request, queryset):
    """
    Soft delete comments using the model's business logic.
    """
    count = 0

    for comment in queryset:
        comment.delete(user=request.user)
        count += 1

    modeladmin.message_user(
        request,
        f"{count} comment(s) soft deleted.",
        level=messages.WARNING,
    )

@admin.action(description="Restore selected comments")
def restore_comments(modeladmin, request, queryset):
    """
    Restore comments using the model's business logic.
    """
    count = 0

    for comment in queryset:
        comment.restore()
        count += 1

    modeladmin.message_user(
        request,
        f"{count} comment(s) restored.",
        level=messages.SUCCESS,
    )

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "author",
        "post",
        "is_deleted",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "is_deleted",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "content",
        "author__username",
        "post__title",
        "post__slug",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
        "is_deleted",
        "deleted_at",
        "deleted_by",
    )

    raw_id_fields = (
        "post",
        "author",
    )

    fieldsets = (
        (
            "Comment",
            {
                "fields": ("content",),
            },
        ),
        (
            "Ownership",
            {
                "fields": ("author",),
            },
        ),
        (
            "Belongs To",
            {
                "fields": ("post",),
            },
        ),
        (
            "Audit Information",
            {
                "fields": (
                    "created_by",
                    "created_at",
                    "updated_by",
                    "updated_at",
                ),
            },
        ),
        (
            "Soft Delete",
            {
                "fields": (
                    "is_deleted",
                    "deleted_by",
                    "deleted_at",
                ),
            },
        ),
    )

    ordering = ("-created_at",)

    actions = (
        soft_delete_comments,
        restore_comments,
    )

    def get_queryset(self, request):
         return Comment.all_objects.select_related(
            "author",
            "post",
        )

    def save_model(self, request, obj, form, change):
        """
        Automatically populate audit fields when saving a comment
        through the Django admin.
        """
        if not change:
            obj.created_by = request.user

        obj.updated_by = request.user

        super().save_model(request, obj, form, change)
