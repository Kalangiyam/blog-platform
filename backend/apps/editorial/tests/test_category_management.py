from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.categories.models import Category
from apps.users.constants import AUTHOR_GROUP, EDITOR_GROUP, ADMINISTRATOR_GROUP

User = get_user_model()


class CategoryManagementTests(TestCase):
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

        self.active_cat = Category.objects.create(name="Active Category", slug="active-category", is_active=True)
        self.inactive_cat = Category.all_objects.create(name="Inactive Category", slug="inactive-category", is_active=False)

    def test_anonymous_and_author_denied(self):
        url = reverse("editorial:editorial-category-list")
        resp_anon = self.client.get(url)
        self.assertEqual(resp_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.author)
        resp_author = self.client.get(url)
        self.assertEqual(resp_author.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_without_editor_denied(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("editorial:editorial-category-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_editor_sees_active_and_inactive_categories(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-category-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data["results"]
        names = [c["name"] for c in results]
        self.assertIn("Active Category", names)
        self.assertIn("Inactive Category", names)

    def test_editor_create_category(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-category-list")
        resp = self.client.post(url, {"name": "New Category", "is_active": True})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Category.objects.filter(name="New Category").exists())

    def test_editor_update_and_deactivate_category(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse("editorial:editorial-category-detail", kwargs={"slug": self.active_cat.slug})
        resp = self.client.patch(url, {"is_active": False})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.active_cat.refresh_from_db()
        self.assertFalse(self.active_cat.is_active)
