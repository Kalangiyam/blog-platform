from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.comments.models import Comment
from apps.posts.choices import PostStatus
from apps.posts.models import Post
from apps.users.constants import ADMINISTRATOR_GROUP, AUTHOR_GROUP, EDITOR_GROUP

User = get_user_model()


class CommentModerationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.editor_group, _ = Group.objects.get_or_create(name=EDITOR_GROUP)
        self.author_group, _ = Group.objects.get_or_create(name=AUTHOR_GROUP)
        self.admin_group, _ = Group.objects.get_or_create(name=ADMINISTRATOR_GROUP)

        self.editor = User.objects.create_user(username="editor1", email="editor1@example.com", password="Password123!")
        self.editor.groups.add(self.editor_group)

        self.author = User.objects.create_user(username="author1", email="author1@example.com", password="Password123!")
        self.author.groups.add(self.author_group)

        self.admin = User.objects.create_user(username="admin1", email="admin1@example.com", password="Password123!")
        self.admin.groups.add(self.admin_group)

        self.author_editor = User.objects.create_user(
            username="author_editor",
            email="author_editor@example.com",
            password="Password123!",
        )
        self.author_editor.groups.add(self.author_group, self.editor_group)

        self.editor_admin = User.objects.create_user(
            username="editor_admin",
            email="editor_admin@example.com",
            password="Password123!",
        )
        self.editor_admin.groups.add(self.editor_group, self.admin_group)

        self.post_pub = Post.objects.create(
            title="Published Post",
            slug="published-post",
            content="Content",
            author=self.author,
            status=PostStatus.PUBLISHED,
        )
        self.post_del = Post.objects.create(
            title="Deleted Post",
            slug="deleted-post",
            content="Content",
            author=self.author,
            status=PostStatus.PUBLISHED,
        )
        self.post_del.delete(user=self.author)

        self.comment_active = Comment.objects.create(
            post=self.post_pub,
            author=self.author,
            content="Active comment",
        )
        self.comment_del = Comment.objects.create(
            post=self.post_pub,
            author=self.author,
            content="Deleted comment",
        )
        self.comment_del.delete(user=self.author)

        self.comment_on_del_post = Comment.objects.create(
            post=self.post_del,
            author=self.author,
            content="Comment on deleted post",
        )
        self.comment_on_del_post.delete(user=self.author)

    def test_editor_list_comments(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-comment-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data["results"]
        contents = [c["content"] for c in results]
        self.assertIn("Active comment", contents)

    def test_restore_deleted_comment(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-comment-restore", kwargs={"pk": self.comment_del.pk})
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.comment_del.refresh_from_db()
        self.assertFalse(self.comment_del.is_deleted)

    def test_restore_comment_on_deleted_post_fails(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-comment-restore", kwargs={"pk": self.comment_on_del_post.pk})
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("post", resp.data)

    def test_editor_soft_deletes_another_users_comment_with_audit_attribution(self):
        original_updated_at = self.comment_active.updated_at
        original_updated_by_id = self.comment_active.updated_by_id
        self.client.force_authenticate(user=self.editor)

        url = reverse(
            "editorial:editorial-comment-detail",
            kwargs={"pk": self.comment_active.pk},
        )
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.comment_active.refresh_from_db()
        self.assertTrue(self.comment_active.is_deleted)
        self.assertIsNotNone(self.comment_active.deleted_at)
        self.assertEqual(self.comment_active.deleted_by_id, self.editor.pk)
        self.assertEqual(self.comment_active.updated_at, original_updated_at)
        self.assertEqual(self.comment_active.updated_by_id, original_updated_by_id)

    def test_editor_deleted_comment_disappears_from_public_listing_and_can_be_restored(self):
        self.client.force_authenticate(user=self.editor)
        delete_url = reverse(
            "editorial:editorial-comment-detail",
            kwargs={"pk": self.comment_active.pk},
        )
        self.assertEqual(
            self.client.delete(delete_url).status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.client.force_authenticate(user=None)
        list_url = reverse(
            "comments:post-comment-list-create",
            kwargs={"post_slug": self.post_pub.slug},
        )
        list_response = self.client.get(list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertNotIn(
            self.comment_active.pk,
            [comment["id"] for comment in list_response.data["results"]],
        )

        self.client.force_authenticate(user=self.editor)
        restore_url = reverse(
            "editorial:editorial-comment-restore",
            kwargs={"pk": self.comment_active.pk},
        )
        restore_response = self.client.post(restore_url)
        self.assertEqual(restore_response.status_code, status.HTTP_200_OK)
        self.comment_active.refresh_from_db()
        self.assertFalse(self.comment_active.is_deleted)

    def test_editorial_delete_is_idempotent_for_already_deleted_comment(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse(
            "editorial:editorial-comment-detail",
            kwargs={"pk": self.comment_del.pk},
        )
        original_deleted_at = self.comment_del.deleted_at
        original_deleted_by_id = self.comment_del.deleted_by_id

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.comment_del.refresh_from_db()
        self.assertEqual(self.comment_del.deleted_at, original_deleted_at)
        self.assertEqual(self.comment_del.deleted_by_id, original_deleted_by_id)

    def test_editorial_delete_unknown_comment_returns_not_found(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-comment-detail", kwargs={"pk": 999999})

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_anonymous_author_and_administrator_only_cannot_delete_editorially(self):
        url = reverse(
            "editorial:editorial-comment-detail",
            kwargs={"pk": self.comment_active.pk},
        )

        self.assertEqual(self.client.delete(url).status_code, status.HTTP_401_UNAUTHORIZED)

        for user in (self.author, self.admin):
            with self.subTest(user=user.username):
                self.client.force_authenticate(user=user)
                self.assertEqual(
                    self.client.delete(url).status_code,
                    status.HTTP_403_FORBIDDEN,
                )

        self.comment_active.refresh_from_db()
        self.assertFalse(self.comment_active.is_deleted)

    def test_users_with_editor_role_can_delete_editorially_when_multi_role(self):
        for user in (self.author_editor, self.editor_admin):
            comment = Comment.objects.create(
                post=self.post_pub,
                author=self.author,
                content=f"Comment for {user.username}",
            )
            url = reverse(
                "editorial:editorial-comment-detail",
                kwargs={"pk": comment.pk},
            )
            with self.subTest(user=user.username):
                self.client.force_authenticate(user=user)
                self.assertEqual(
                    self.client.delete(url).status_code,
                    status.HTTP_204_NO_CONTENT,
                )
                comment.refresh_from_db()
                self.assertEqual(comment.deleted_by_id, user.pk)
