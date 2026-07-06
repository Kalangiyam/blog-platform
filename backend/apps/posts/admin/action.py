from django.contrib import admin, messages
from django.utils import timezone

from ..choices import PostStatus


@admin.action(description="Publish selected posts")
def publish_posts(modeladmin, request, queryset):
    """
    Bulk publish selected posts.
    """
    updated = queryset.update(
        status=PostStatus.PUBLISHED,
        published_at=timezone.now(),
    )

    modeladmin.message_user(
        request,
        f"{updated} post(s) were successfully published.",
        level=messages.SUCCESS,
    )


@admin.action(description="Move selected posts to Draft")
def draft_posts(modeladmin, request, queryset):
    """
    Bulk move selected posts to draft.
    """
    updated = queryset.update(
        status=PostStatus.DRAFT,
        published_at=None,
    )

    modeladmin.message_user(
        request,
        f"{updated} post(s) moved to draft.",
        level=messages.SUCCESS,
    )



@admin.action(description="Soft delete selected posts")
def soft_delete_posts(modeladmin, request, queryset):
    """
    Soft delete posts using the model's business logic.
    """
    count = 0

    for post in queryset:
        post.delete(user=request.user)
        count += 1

    modeladmin.message_user(
        request,
        f"{count} post(s) soft deleted.",
        level=messages.WARNING,
    )


@admin.action(description="Restore selected posts")
def restore_posts(modeladmin, request, queryset):
    """
    Restore posts using the model's business logic.
    """
    count = 0

    for post in queryset:
        post.restore()
        count += 1

    modeladmin.message_user(
        request,
        f"{count} post(s) restored.",
        level=messages.SUCCESS,
    )