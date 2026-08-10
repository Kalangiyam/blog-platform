from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.categories.models import Category
from apps.posts.choices import PostStatus
from apps.posts.models import Post
from apps.tags.models import Tag
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

        self.other_author = User.objects.create_user(
            username="author2",
            email="author2@example.com",
            password="Password123!",
        )
        self.other_author.groups.add(self.author_group)

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

        self.category = Category.objects.create(name="Architecture", slug="architecture")
        self.tag = Tag.objects.create(name="Django", slug="django")

        self.post1 = Post.objects.create(
            title="Author Post 1",
            slug="author-post-1",
            excerpt="Author draft excerpt",
            content="Content 1",
            author=self.author,
            status=PostStatus.DRAFT,
            updated_by=self.other_author,
            featured_image="posts/featured/author-post-1/example.png",
        )
        self.post1.categories.add(self.category)
        self.post1.tags.add(self.tag)
        self.author_published = Post.objects.create(
            title="Author Published Post",
            slug="author-published-post",
            content="Published content",
            author=self.author,
            status=PostStatus.PUBLISHED,
            published_at=timezone.now(),
        )
        self.post2 = Post.objects.create(
            title="Editor Post 1",
            slug="editor-post-1",
            content="Content 2",
            author=self.editor,
            status=PostStatus.PUBLISHED,
        )
        self.other_author_draft = Post.objects.create(
            title="Other Author Draft",
            slug="other-author-draft",
            content="Private draft",
            author=self.other_author,
            status=PostStatus.DRAFT,
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

    def test_author_retrieves_own_active_draft_and_published_posts(self):
        self.client.force_authenticate(user=self.author)

        for post in (self.post1, self.author_published):
            with self.subTest(slug=post.slug):
                url = reverse(
                    "editorial:editorial-post-detail",
                    kwargs={"slug": post.slug},
                )
                response = self.client.get(url)
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(response.data["slug"], post.slug)

    def test_author_cannot_retrieve_another_authors_draft(self):
        self.client.force_authenticate(user=self.author)
        url = reverse(
            "editorial:editorial-post-detail",
            kwargs={"slug": self.other_author_draft.slug},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_editor_retrieves_another_authors_draft(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse(
            "editorial:editorial-post-detail",
            kwargs={"slug": self.other_author_draft.slug},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["content"], self.other_author_draft.content)

    def test_anonymous_and_administrator_only_are_denied_management_detail(self):
        url = reverse(
            "editorial:editorial-post-detail",
            kwargs={"slug": self.post1.slug},
        )

        self.assertEqual(self.client.get(url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(user=self.admin)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)

    def test_editor_management_detail_unknown_slug_returns_not_found(self):
        self.client.force_authenticate(user=self.editor)
        url = reverse(
            "editorial:editorial-post-detail",
            kwargs={"slug": "unknown-post"},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_soft_deleted_post_is_not_retrievable_for_management(self):
        url = reverse(
            "editorial:editorial-post-detail",
            kwargs={"slug": self.deleted_post.slug},
        )

        for user in (self.author, self.editor, self.author_editor, self.editor_admin):
            with self.subTest(user=user.username):
                self.client.force_authenticate(user=user)
                self.assertEqual(
                    self.client.get(url).status_code,
                    status.HTTP_404_NOT_FOUND,
                )

    def test_multi_role_editor_authority_remains_independent(self):
        url = reverse(
            "editorial:editorial-post-detail",
            kwargs={"slug": self.other_author_draft.slug},
        )

        for user in (self.author_editor, self.editor_admin):
            with self.subTest(user=user.username):
                self.client.force_authenticate(user=user)
                self.assertEqual(
                    self.client.get(url).status_code,
                    status.HTTP_200_OK,
                )

    def test_management_detail_get_does_not_mutate_post_or_relationships(self):
        self.client.force_authenticate(user=self.author)
        self.post1.refresh_from_db()
        before = {
            "updated_at": self.post1.updated_at,
            "updated_by_id": self.post1.updated_by_id,
            "status": self.post1.status,
            "published_at": self.post1.published_at,
            "title": self.post1.title,
            "slug": self.post1.slug,
            "excerpt": self.post1.excerpt,
            "content": self.post1.content,
            "featured_image": self.post1.featured_image.name,
            "is_deleted": self.post1.is_deleted,
            "deleted_at": self.post1.deleted_at,
            "deleted_by_id": self.post1.deleted_by_id,
            "categories": list(
                self.post1.categories.order_by("pk").values_list("pk", flat=True)
            ),
            "tags": list(
                self.post1.tags.order_by("pk").values_list("pk", flat=True)
            ),
        }
        url = reverse(
            "editorial:editorial-post-detail",
            kwargs={"slug": self.post1.slug},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post1.refresh_from_db()
        after = {
            "updated_at": self.post1.updated_at,
            "updated_by_id": self.post1.updated_by_id,
            "status": self.post1.status,
            "published_at": self.post1.published_at,
            "title": self.post1.title,
            "slug": self.post1.slug,
            "excerpt": self.post1.excerpt,
            "content": self.post1.content,
            "featured_image": self.post1.featured_image.name,
            "is_deleted": self.post1.is_deleted,
            "deleted_at": self.post1.deleted_at,
            "deleted_by_id": self.post1.deleted_by_id,
            "categories": list(
                self.post1.categories.order_by("pk").values_list("pk", flat=True)
            ),
            "tags": list(
                self.post1.tags.order_by("pk").values_list("pk", flat=True)
            ),
        }
        self.assertEqual(after, before)

    def test_list_filters_do_not_affect_retrieve_or_restore(self):
        self.client.force_authenticate(user=self.editor)
        detail_url = reverse(
            "editorial:editorial-post-detail",
            kwargs={"slug": self.post1.slug},
        )
        detail_response = self.client.get(
            detail_url + "?status=published&is_deleted=true"
        )
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

        restore_url = reverse(
            "editorial:editorial-post-restore",
            kwargs={"slug": self.deleted_post.slug},
        )
        restore_response = self.client.post(
            restore_url + "?status=draft&is_deleted=false"
        )
        self.assertEqual(restore_response.status_code, status.HTTP_200_OK)
        self.deleted_post.refresh_from_db()
        self.assertFalse(self.deleted_post.is_deleted)

    def test_public_detail_remains_published_only(self):
        draft_url = reverse("posts:post-detail", kwargs={"slug": self.post1.slug})
        published_url = reverse(
            "posts:post-detail",
            kwargs={"slug": self.author_published.slug},
        )

        self.assertEqual(
            self.client.get(draft_url).status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(
            self.client.get(published_url).status_code,
            status.HTTP_200_OK,
        )
