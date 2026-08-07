from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.tags.models import Tag
from apps.users.constants import AUTHOR_GROUP, EDITOR_GROUP, ADMINISTRATOR_GROUP

User = get_user_model()


class TagManagementTests(TestCase):
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

        self.active_tag = Tag.objects.create(name="Active Tag", slug="active-tag", is_active=True)
        self.inactive_tag = Tag.all_objects.create(name="Inactive Tag", slug="inactive-tag", is_active=False)

    def test_anonymous_and_author_denied(self):
        url = reverse("editorial:editorial-tag-list")
        resp_anon = self.client.get(url)
        self.assertEqual(resp_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.author)
        resp_author = self.client.get(url)
        self.assertEqual(resp_author.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_without_editor_denied(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("editorial:editorial-tag-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_editor_sees_active_and_inactive_tags(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-tag-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data["results"]
        names = [t["name"] for t in results]
        self.assertIn("Active Tag", names)
        self.assertIn("Inactive Tag", names)

    def test_editor_create_tag(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-tag-list")
        resp = self.client.post(url, {"name": "New Tag", "is_active": True})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Tag.objects.filter(name="New Tag").exists())

    def test_editor_update_and_deactivate_tag(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-tag-detail", kwargs={"slug": self.active_tag.slug})
        resp = self.client.patch(url, {"is_active": False})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.active_tag.refresh_from_db()
        self.assertFalse(self.active_tag.is_active)
