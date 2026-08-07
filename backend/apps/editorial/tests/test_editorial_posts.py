from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.posts.choices import PostStatus
from apps.posts.models import Post
from apps.users.constants import AUTHOR_GROUP, EDITOR_GROUP, ADMINISTRATOR_GROUP

User = get_user_model()


class EditorialPostsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.author_group, _ = Group.objects.get_or_create(name=AUTHOR_GROUP)
        self.editor_group, _ = Group.objects.get_or_create(name=EDITOR_GROUP)
        self.admin_group, _ = Group.objects.get_or_create(name=ADMINISTRATOR_GROUP)

        self.author = User.objects.create_user(username="author1", email="author1@example.com", password="Password123!")
        self.author.groups.add(self.author_group)

        self.editor = User.objects.create_user(username="editor1", email="editor1@example.com", password="Password123!")
        self.editor.groups.add(self.editor_group)

        self.admin = User.objects.create_user(username="admin1", email="admin1@example.com", password="Password123!")
        self.admin.groups.add(self.admin_group)

        self.post1 = Post.objects.create(
            title="Author Post 1",
            slug="author-post-1",
            content="Content 1",
            author=self.author,
            status=PostStatus.DRAFT,
        )
        self.post2 = Post.objects.create(
            title="Editor Post 1",
            slug="editor-post-1",
            content="Content 2",
            author=self.editor,
            status=PostStatus.PUBLISHED,
        )
        self.deleted_post = Post.objects.create(
            title="Deleted Post 1",
            slug="deleted-post-1",
            content="Content 3",
            author=self.author,
            status=PostStatus.PUBLISHED,
        )
        self.deleted_post.delete(user=self.author)

    def test_author_sees_only_own_posts(self):
        self.client.force_authenticate(user=self.author)
        url = reverse("editorial:editorial-post-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        slugs = [p["slug"] for p in results]
        self.assertIn("author-post-1", slugs)
        self.assertNotIn("editor-post-1", slugs)

    def test_editor_sees_all_posts(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-post-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        slugs = [p["slug"] for p in results]
        self.assertIn("author-post-1", slugs)
        self.assertIn("editor-post-1", slugs)

    def test_admin_without_editor_denied(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("editorial:editorial-post-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_by_status(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-post-list") + "?status=draft"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"]
        for p in results:
            self.assertEqual(p["status"], PostStatus.DRAFT)

    def test_invalid_filter_rejected(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-post-list") + "?status=invalid_status"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_restore_post(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-post-restore", kwargs={"slug": "deleted-post-1"})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deleted_post.refresh_from_db()
        self.assertFalse(self.deleted_post.is_deleted)
