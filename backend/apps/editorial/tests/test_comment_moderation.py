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


class CommentModerationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.editor_group, _ = Group.objects.get_or_create(name=EDITOR_GROUP)
        self.author_group, _ = Group.objects.get_or_create(name=AUTHOR_GROUP)

        self.editor = User.objects.create_user(username="editor1", email="editor1@example.com", password="Password123!")
        self.editor.groups.add(self.editor_group)

        self.author = User.objects.create_user(username="author1", email="author1@example.com", password="Password123!")
        self.author.groups.add(self.author_group)

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
