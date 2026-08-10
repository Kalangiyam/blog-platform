from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.comments.models import Comment
from apps.posts.choices import PostStatus
from apps.posts.models import Post
from apps.users.constants import AUTHOR_GROUP, EDITOR_GROUP

User = get_user_model()


class PublicCommentDeletePermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        author_group, _ = Group.objects.get_or_create(name=AUTHOR_GROUP)
        editor_group, _ = Group.objects.get_or_create(name=EDITOR_GROUP)

        self.owner = User.objects.create_user(
            username="comment_owner",
            email="comment-owner@example.com",
            password="Password123!",
        )
        self.owner.groups.add(author_group)
        self.editor = User.objects.create_user(
            username="non_owner_editor",
            email="non-owner-editor@example.com",
            password="Password123!",
        )
        self.editor.groups.add(editor_group)
        self.post = Post.objects.create(
            title="Published Comment Post",
            slug="published-comment-post",
            content="Content",
            author=self.owner,
            status=PostStatus.PUBLISHED,
        )
        self.comment = Comment.objects.create(
            post=self.post,
            author=self.owner,
            content="Owner comment",
        )
        self.url = reverse(
            "comments:comment-update-delete",
            kwargs={"pk": self.comment.pk},
        )

    def test_owner_can_delete_and_receives_audit_attribution(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.comment.refresh_from_db()
        self.assertTrue(self.comment.is_deleted)
        self.assertEqual(self.comment.deleted_by_id, self.owner.pk)

    def test_editor_cannot_override_ownership_on_public_delete(self):
        self.client.force_authenticate(user=self.editor)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.comment.refresh_from_db()
        self.assertFalse(self.comment.is_deleted)

    def test_anonymous_user_cannot_delete_through_public_endpoint(self):
        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.comment.refresh_from_db()
        self.assertFalse(self.comment.is_deleted)
