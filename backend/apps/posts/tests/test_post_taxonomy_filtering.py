"""
Taxonomy filtering tests for the published Post list API.

Covers:
- QuerySet-level: for_category(), for_tag(), chaining
- API-level: category param, tag param, combined AND, visibility, pagination,
  nested representations, empty params, unknown slugs, inactive taxonomies
- Regression: existing unfiltered behavior, draft/soft-delete exclusion,
  duplicate-row detection, query efficiency
"""
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.categories.models import Category
from apps.posts.choices import PostStatus
from apps.posts.models import Post
from apps.tags.models import Tag

User = get_user_model()

POST_LIST_URL = reverse("posts:post-list")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user(username="author", email="author@example.com"):
    return User.objects.create_user(
        username=username,
        email=email,
        password="TestPass123!",
    )


def make_category(name, is_active=True):
    """
    Create a Category with an explicit slug.

    Category.slug is editable=False and set only by the serializer's
    create() method. In tests, we must supply it manually.
    """
    cat = Category.all_objects.create(
        name=name,
        slug=slugify(name),
        is_active=is_active,
    )
    return cat


def make_tag(name, is_active=True):
    """
    Create a Tag with an explicit slug.

    Tag.slug is editable=False and set only by the serializer's
    create() method. In tests, we must supply it manually.
    """
    tag = Tag.all_objects.create(
        name=name,
        slug=slugify(name),
        is_active=is_active,
    )
    return tag


def make_published_post(title, author, categories=(), tags=()):
    post = Post.objects.create(
        title=title,
        slug=title.lower().replace(" ", "-"),
        author=author,
        content="Some content.",
        status=PostStatus.PUBLISHED,
        published_at=timezone.now(),
    )
    if categories:
        post.categories.set(categories)
    if tags:
        post.tags.set(tags)
    return post


def make_draft_post(title, author, categories=(), tags=()):
    post = Post.objects.create(
        title=title,
        slug=title.lower().replace(" ", "-") + "-draft",
        author=author,
        content="Draft content.",
        status=PostStatus.DRAFT,
    )
    if categories:
        post.categories.set(categories)
    if tags:
        post.tags.set(tags)
    return post


def make_soft_deleted_post(title, author, categories=(), tags=()):
    post = make_published_post(
        title + "-del",
        author,
        categories=categories,
        tags=tags,
    )
    post.delete(user=author)
    return post


def response_slugs(response):
    """Return ordered list of post slugs from a paginated list response."""
    return [item["slug"] for item in response.data["results"]]


# ===========================================================================
# A. QuerySet-Level Tests
# ===========================================================================

class PostQuerySetForCategoryTests(TestCase):
    """Unit tests for PostQuerySet.for_category()."""

    def setUp(self):
        self.author = make_user()
        self.django_cat = make_category("Django")
        self.react_cat = make_category("React")
        self.post_a = make_published_post("Post A", self.author, categories=[self.django_cat])
        self.post_b = make_published_post("Post B", self.author, categories=[self.react_cat])
        self.post_c = make_published_post("Post C", self.author, categories=[self.django_cat])

    def _qs(self):
        return Post.objects.published()

    def test_filters_to_correct_posts(self):
        qs = self._qs().for_category(self.django_cat.slug)
        slugs = set(qs.values_list("slug", flat=True))
        self.assertIn(self.post_a.slug, slugs)
        self.assertIn(self.post_c.slug, slugs)
        self.assertNotIn(self.post_b.slug, slugs)

    def test_empty_slug_returns_unchanged_queryset(self):
        qs_all = self._qs()
        qs_filtered = qs_all.for_category("")
        self.assertEqual(set(qs_all), set(qs_filtered))

    def test_whitespace_slug_returns_unchanged_queryset(self):
        qs_all = self._qs()
        qs_filtered = qs_all.for_category("   ")
        self.assertEqual(set(qs_all), set(qs_filtered))

    def test_unknown_slug_returns_empty(self):
        qs = self._qs().for_category("does-not-exist")
        self.assertFalse(qs.exists())

    def test_inactive_category_slug_returns_empty(self):
        inactive_cat = make_category("Inactive", is_active=False)
        make_published_post("Post X", self.author, categories=[inactive_cat])
        # Category.objects (ActiveStatusManager) won't see it → empty
        qs = self._qs().for_category(inactive_cat.slug)
        self.assertFalse(qs.exists())

    def test_chainable(self):
        """Verify method returns a QuerySet that supports further chaining."""
        qs = self._qs().for_category(self.django_cat.slug).filter(
            title__icontains="Post A"
        )
        self.assertEqual(qs.count(), 1)

    def test_draft_excluded_when_starting_from_published(self):
        draft = make_draft_post("Draft Django", self.author, categories=[self.django_cat])
        qs = self._qs().for_category(self.django_cat.slug)
        slugs = list(qs.values_list("slug", flat=True))
        self.assertNotIn(draft.slug, slugs)

    def test_soft_deleted_excluded(self):
        deleted = make_soft_deleted_post("Deleted Django", self.author, categories=[self.django_cat])
        qs = self._qs().for_category(self.django_cat.slug)
        slugs = list(qs.values_list("slug", flat=True))
        self.assertNotIn(deleted.slug, slugs)

    def test_no_duplicate_ids(self):
        """A post in one category should not appear more than once."""
        qs = self._qs().for_category(self.django_cat.slug)
        ids = list(qs.values_list("id", flat=True))
        self.assertEqual(len(ids), len(set(ids)))


class PostQuerySetForTagTests(TestCase):
    """Unit tests for PostQuerySet.for_tag()."""

    def setUp(self):
        self.author = make_user()
        self.python_tag = make_tag("Python")
        self.js_tag = make_tag("JavaScript")
        self.post_a = make_published_post("Post A", self.author, tags=[self.python_tag])
        self.post_b = make_published_post("Post B", self.author, tags=[self.js_tag])
        self.post_c = make_published_post("Post C", self.author, tags=[self.python_tag])

    def _qs(self):
        return Post.objects.published()

    def test_filters_to_correct_posts(self):
        qs = self._qs().for_tag(self.python_tag.slug)
        slugs = set(qs.values_list("slug", flat=True))
        self.assertIn(self.post_a.slug, slugs)
        self.assertIn(self.post_c.slug, slugs)
        self.assertNotIn(self.post_b.slug, slugs)

    def test_empty_slug_returns_unchanged_queryset(self):
        qs_all = self._qs()
        qs_filtered = qs_all.for_tag("")
        self.assertEqual(set(qs_all), set(qs_filtered))

    def test_whitespace_slug_returns_unchanged_queryset(self):
        qs_all = self._qs()
        qs_filtered = qs_all.for_tag("   ")
        self.assertEqual(set(qs_all), set(qs_filtered))

    def test_unknown_slug_returns_empty(self):
        qs = self._qs().for_tag("does-not-exist")
        self.assertFalse(qs.exists())

    def test_inactive_tag_slug_returns_empty(self):
        inactive_tag = make_tag("Inactive", is_active=False)
        make_published_post("Post X", self.author, tags=[inactive_tag])
        qs = self._qs().for_tag(inactive_tag.slug)
        self.assertFalse(qs.exists())

    def test_chainable(self):
        qs = self._qs().for_tag(self.python_tag.slug).filter(
            title__icontains="Post A"
        )
        self.assertEqual(qs.count(), 1)

    def test_draft_excluded_when_starting_from_published(self):
        draft = make_draft_post("Draft Python", self.author, tags=[self.python_tag])
        qs = self._qs().for_tag(self.python_tag.slug)
        slugs = list(qs.values_list("slug", flat=True))
        self.assertNotIn(draft.slug, slugs)

    def test_soft_deleted_excluded(self):
        deleted = make_soft_deleted_post("Deleted Python", self.author, tags=[self.python_tag])
        qs = self._qs().for_tag(self.python_tag.slug)
        slugs = list(qs.values_list("slug", flat=True))
        self.assertNotIn(deleted.slug, slugs)

    def test_no_duplicate_ids(self):
        qs = self._qs().for_tag(self.python_tag.slug)
        ids = list(qs.values_list("id", flat=True))
        self.assertEqual(len(ids), len(set(ids)))


class PostQuerySetCombinedFilterTests(TestCase):
    """Unit tests for chaining for_category() and for_tag()."""

    def setUp(self):
        self.author = make_user()
        self.django_cat = make_category("Django")
        self.flask_cat = make_category("Flask")
        self.python_tag = make_tag("Python")
        self.js_tag = make_tag("JavaScript")

        # Post A: Django + Python  → should match
        self.post_a = make_published_post("Post A", self.author,
                                          categories=[self.django_cat],
                                          tags=[self.python_tag])
        # Post B: Django + JavaScript → Django matches, Python does not
        self.post_b = make_published_post("Post B", self.author,
                                          categories=[self.django_cat],
                                          tags=[self.js_tag])
        # Post C: Flask + Python → Python matches, Django does not
        self.post_c = make_published_post("Post C", self.author,
                                          categories=[self.flask_cat],
                                          tags=[self.python_tag])
        # Post D: Flask + JavaScript → neither matches
        self.post_d = make_published_post("Post D", self.author,
                                          categories=[self.flask_cat],
                                          tags=[self.js_tag])

    def _qs(self):
        return Post.objects.published()

    def test_combined_and_semantics(self):
        qs = (
            self._qs()
            .for_category(self.django_cat.slug)
            .for_tag(self.python_tag.slug)
        )
        slugs = set(qs.values_list("slug", flat=True))
        self.assertIn(self.post_a.slug, slugs)
        self.assertNotIn(self.post_b.slug, slugs)
        self.assertNotIn(self.post_c.slug, slugs)
        self.assertNotIn(self.post_d.slug, slugs)
        self.assertEqual(qs.count(), 1)

    def test_no_duplicate_ids_combined(self):
        qs = (
            self._qs()
            .for_category(self.django_cat.slug)
            .for_tag(self.python_tag.slug)
        )
        ids = list(qs.values_list("id", flat=True))
        self.assertEqual(len(ids), len(set(ids)))


# ===========================================================================
# B. API-Level Tests
# ===========================================================================

class PostListRegressionTests(TestCase):
    """Verify the unfiltered GET /api/posts/ endpoint is unchanged."""

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()
        self.cat = make_category("Django")
        self.tag = make_tag("Python")
        self.post_a = make_published_post("Post A", self.author,
                                          categories=[self.cat], tags=[self.tag])
        self.post_b = make_published_post("Post B", self.author)

    def test_returns_200(self):
        response = self.client.get(POST_LIST_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_pagination_envelope_present(self):
        response = self.client.get(POST_LIST_URL)
        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)

    def test_all_published_posts_included(self):
        response = self.client.get(POST_LIST_URL)
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)
        self.assertIn(self.post_b.slug, slugs)

    def test_result_fields_match_contract(self):
        response = self.client.get(POST_LIST_URL)
        result = response.data["results"][0]
        for field in ("id", "title", "slug", "excerpt",
                      "featured_image_url", "author",
                      "published_at", "categories", "tags"):
            self.assertIn(field, result)

    def test_nested_author_fields(self):
        response = self.client.get(POST_LIST_URL)
        result = response.data["results"][0]
        self.assertIn("id", result["author"])
        self.assertIn("username", result["author"])

    def test_nested_category_fields(self):
        response = self.client.get(POST_LIST_URL)
        # Find the post with a category
        post_with_cat = next(
            r for r in response.data["results"] if r["categories"]
        )
        cat = post_with_cat["categories"][0]
        self.assertIn("name", cat)
        self.assertIn("slug", cat)

    def test_nested_tag_fields(self):
        response = self.client.get(POST_LIST_URL)
        post_with_tag = next(
            r for r in response.data["results"] if r["tags"]
        )
        tag = post_with_tag["tags"][0]
        self.assertIn("name", tag)
        self.assertIn("slug", tag)

    def test_draft_excluded(self):
        draft = make_draft_post("Draft Post", self.author)
        response = self.client.get(POST_LIST_URL)
        slugs = response_slugs(response)
        self.assertNotIn(draft.slug, slugs)

    def test_soft_deleted_excluded(self):
        deleted = make_soft_deleted_post("Deleted Post", self.author)
        response = self.client.get(POST_LIST_URL)
        slugs = response_slugs(response)
        self.assertNotIn(deleted.slug, slugs)

    def test_ordering_deterministic(self):
        """Results are ordered by -published_at, -created_at, -pk."""
        response = self.client.get(POST_LIST_URL)
        results = response.data["results"]
        pks = [r["id"] for r in results]
        # post_b created after post_a so should come first
        self.assertGreater(pks[0], pks[1])


class PostListCategoryFilterTests(TestCase):
    """API tests for ?category= parameter."""

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()
        self.django_cat = make_category("Django")
        self.react_cat = make_category("React")
        self.post_a = make_published_post("Post A", self.author, categories=[self.django_cat])
        self.post_b = make_published_post("Post B", self.author, categories=[self.react_cat])
        self.post_c = make_published_post("Post C", self.author, categories=[self.django_cat])

    def test_category_filter_returns_200(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_category_filter_returns_matching_posts_only(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)
        self.assertIn(self.post_c.slug, slugs)
        self.assertNotIn(self.post_b.slug, slugs)

    def test_category_filter_count_correct(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        self.assertEqual(response.data["count"], 2)

    def test_category_filter_pagination_envelope_present(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)

    def test_category_filter_nested_repr_intact(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        result = response.data["results"][0]
        cat_slugs = [c["slug"] for c in result["categories"]]
        self.assertIn(self.django_cat.slug, cat_slugs)

    def test_category_draft_excluded(self):
        draft = make_draft_post("Draft Django", self.author, categories=[self.django_cat])
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        slugs = response_slugs(response)
        self.assertNotIn(draft.slug, slugs)

    def test_category_soft_deleted_excluded(self):
        deleted = make_soft_deleted_post("Del Django", self.author, categories=[self.django_cat])
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        slugs = response_slugs(response)
        self.assertNotIn(deleted.slug, slugs)

    def test_category_no_duplicate_posts(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        slugs = [r["slug"] for r in response.data["results"]]
        self.assertEqual(len(slugs), len(set(slugs)))


class PostListTagFilterTests(TestCase):
    """API tests for ?tag= parameter."""

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()
        self.python_tag = make_tag("Python")
        self.js_tag = make_tag("JavaScript")
        self.post_a = make_published_post("Post A", self.author, tags=[self.python_tag])
        self.post_b = make_published_post("Post B", self.author, tags=[self.js_tag])
        self.post_c = make_published_post("Post C", self.author, tags=[self.python_tag])

    def test_tag_filter_returns_200(self):
        response = self.client.get(POST_LIST_URL, {"tag": self.python_tag.slug})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_tag_filter_returns_matching_posts_only(self):
        response = self.client.get(POST_LIST_URL, {"tag": self.python_tag.slug})
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)
        self.assertIn(self.post_c.slug, slugs)
        self.assertNotIn(self.post_b.slug, slugs)

    def test_tag_filter_count_correct(self):
        response = self.client.get(POST_LIST_URL, {"tag": self.python_tag.slug})
        self.assertEqual(response.data["count"], 2)

    def test_tag_filter_pagination_envelope_present(self):
        response = self.client.get(POST_LIST_URL, {"tag": self.python_tag.slug})
        for key in ("count", "next", "previous", "results"):
            self.assertIn(key, response.data)

    def test_tag_filter_nested_repr_intact(self):
        response = self.client.get(POST_LIST_URL, {"tag": self.python_tag.slug})
        result = response.data["results"][0]
        tag_slugs = [t["slug"] for t in result["tags"]]
        self.assertIn(self.python_tag.slug, tag_slugs)

    def test_tag_draft_excluded(self):
        draft = make_draft_post("Draft Python", self.author, tags=[self.python_tag])
        response = self.client.get(POST_LIST_URL, {"tag": self.python_tag.slug})
        slugs = response_slugs(response)
        self.assertNotIn(draft.slug, slugs)

    def test_tag_soft_deleted_excluded(self):
        deleted = make_soft_deleted_post("Del Python", self.author, tags=[self.python_tag])
        response = self.client.get(POST_LIST_URL, {"tag": self.python_tag.slug})
        slugs = response_slugs(response)
        self.assertNotIn(deleted.slug, slugs)

    def test_tag_no_duplicate_posts(self):
        response = self.client.get(POST_LIST_URL, {"tag": self.python_tag.slug})
        slugs = [r["slug"] for r in response.data["results"]]
        self.assertEqual(len(slugs), len(set(slugs)))


class PostListCombinedFilterTests(TestCase):
    """API tests for combined ?category=&tag= with AND semantics."""

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()
        self.django_cat = make_category("Django")
        self.flask_cat = make_category("Flask")
        self.python_tag = make_tag("Python")
        self.js_tag = make_tag("JavaScript")

        self.post_a = make_published_post("Post A", self.author,
                                          categories=[self.django_cat],
                                          tags=[self.python_tag])
        self.post_b = make_published_post("Post B", self.author,
                                          categories=[self.django_cat],
                                          tags=[self.js_tag])
        self.post_c = make_published_post("Post C", self.author,
                                          categories=[self.flask_cat],
                                          tags=[self.python_tag])
        self.post_d = make_published_post("Post D", self.author,
                                          categories=[self.flask_cat],
                                          tags=[self.js_tag])

    def test_combined_returns_200(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "tag": self.python_tag.slug,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_combined_and_semantics(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "tag": self.python_tag.slug,
        })
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)
        self.assertNotIn(self.post_b.slug, slugs)
        self.assertNotIn(self.post_c.slug, slugs)
        self.assertNotIn(self.post_d.slug, slugs)

    def test_combined_count_correct(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "tag": self.python_tag.slug,
        })
        self.assertEqual(response.data["count"], 1)

    def test_combined_no_duplicates(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "tag": self.python_tag.slug,
        })
        slugs = [r["slug"] for r in response.data["results"]]
        self.assertEqual(len(slugs), len(set(slugs)))

    def test_combined_nested_category_present(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "tag": self.python_tag.slug,
        })
        result = response.data["results"][0]
        cat_slugs = [c["slug"] for c in result["categories"]]
        self.assertIn(self.django_cat.slug, cat_slugs)

    def test_combined_nested_tag_present(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "tag": self.python_tag.slug,
        })
        result = response.data["results"][0]
        tag_slugs = [t["slug"] for t in result["tags"]]
        self.assertIn(self.python_tag.slug, tag_slugs)


class PostListUnknownSlugTests(TestCase):
    """Unknown slugs must return 200 with an empty paginated collection."""

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()
        make_published_post("Post A", self.author)

    def test_unknown_category_returns_200(self):
        response = self.client.get(POST_LIST_URL, {"category": "does-not-exist"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unknown_category_returns_empty_collection(self):
        response = self.client.get(POST_LIST_URL, {"category": "does-not-exist"})
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])

    def test_unknown_tag_returns_200(self):
        response = self.client.get(POST_LIST_URL, {"tag": "does-not-exist"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unknown_tag_returns_empty_collection(self):
        response = self.client.get(POST_LIST_URL, {"tag": "does-not-exist"})
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])

    def test_unknown_category_and_tag_returns_empty(self):
        response = self.client.get(POST_LIST_URL, {
            "category": "does-not-exist",
            "tag": "also-does-not-exist",
        })
        self.assertEqual(response.data["count"], 0)

    def test_valid_category_unknown_tag_returns_empty(self):
        cat = make_category("Django")
        make_published_post("Django Post", self.author, categories=[cat])
        response = self.client.get(POST_LIST_URL, {
            "category": cat.slug,
            "tag": "no-such-tag",
        })
        self.assertEqual(response.data["count"], 0)


class PostListInactiveTaxonomyTests(TestCase):
    """Inactive taxonomy slugs must return 200 with an empty collection."""

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()

    def test_inactive_category_returns_empty(self):
        inactive_cat = make_category("Inactive Cat", is_active=False)
        # Even if a post is associated, it must not appear
        make_published_post("Post X", self.author, categories=[inactive_cat])
        response = self.client.get(POST_LIST_URL, {"category": inactive_cat.slug})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_inactive_tag_returns_empty(self):
        inactive_tag = make_tag("Inactive Tag", is_active=False)
        make_published_post("Post Y", self.author, tags=[inactive_tag])
        response = self.client.get(POST_LIST_URL, {"tag": inactive_tag.slug})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_inactive_category_envelope(self):
        inactive_cat = make_category("Inactive Cat 2", is_active=False)
        response = self.client.get(POST_LIST_URL, {"category": inactive_cat.slug})
        self.assertIsNone(response.data["next"])
        self.assertIsNone(response.data["previous"])
        self.assertEqual(response.data["results"], [])

    def test_inactive_tag_envelope(self):
        inactive_tag = make_tag("Inactive Tag 2", is_active=False)
        response = self.client.get(POST_LIST_URL, {"tag": inactive_tag.slug})
        self.assertIsNone(response.data["next"])
        self.assertIsNone(response.data["previous"])
        self.assertEqual(response.data["results"], [])


class PostListEmptyParameterTests(TestCase):
    """Empty and whitespace query parameters must be ignored."""

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()
        self.django_cat = make_category("Django")
        self.react_cat = make_category("React")
        self.python_tag = make_tag("Python")
        self.js_tag = make_tag("JavaScript")
        # post_a: Django + Python — matches any single filter
        self.post_a = make_published_post("Post A", self.author,
                                          categories=[self.django_cat],
                                          tags=[self.python_tag])
        # post_b: React + JavaScript — does NOT match django or python
        self.post_b = make_published_post("Post B", self.author,
                                          categories=[self.react_cat],
                                          tags=[self.js_tag])

    def test_empty_category_ignored(self):
        """?category= returns full published list."""
        response = self.client.get(POST_LIST_URL, {"category": ""})
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)
        self.assertIn(self.post_b.slug, slugs)

    def test_empty_tag_ignored(self):
        """?tag= returns full published list."""
        response = self.client.get(POST_LIST_URL, {"tag": ""})
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)
        self.assertIn(self.post_b.slug, slugs)

    def test_both_empty_params_return_full_list(self):
        """?category=&tag= returns full published list."""
        response = self.client.get(POST_LIST_URL, {"category": "", "tag": ""})
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)
        self.assertIn(self.post_b.slug, slugs)

    def test_empty_category_valid_tag_filters_by_tag_only(self):
        """?category=&tag=python filters by Python only."""
        response = self.client.get(POST_LIST_URL, {"category": "", "tag": self.python_tag.slug})
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)   # has Python tag
        self.assertNotIn(self.post_b.slug, slugs)  # has JavaScript tag, not Python
        self.assertEqual(response.data["count"], 1)

    def test_valid_category_empty_tag_filters_by_category_only(self):
        """?category=django&tag= filters by Django only."""
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug, "tag": ""})
        slugs = response_slugs(response)
        self.assertIn(self.post_a.slug, slugs)   # in Django category
        self.assertNotIn(self.post_b.slug, slugs)  # in React category, not Django
        self.assertEqual(response.data["count"], 1)


class PostListPaginationFilterTests(TestCase):
    """Pagination must work correctly alongside taxonomy filters."""

    PAGE_SIZE = 20  # StandardPageNumberPagination default

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()
        self.django_cat = make_category("Django")
        self.python_tag = make_tag("Python")

        # Create 25 Django+Python posts to exceed one page
        self.all_posts = []
        for i in range(25):
            p = make_published_post(
                f"Django Post {i:02d}",
                self.author,
                categories=[self.django_cat],
                tags=[self.python_tag],
            )
            self.all_posts.append(p)

    def test_category_filter_correct_count(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        self.assertEqual(response.data["count"], 25)

    def test_category_filter_page1_has_default_page_size(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        self.assertEqual(len(response.data["results"]), self.PAGE_SIZE)

    def test_category_filter_page2_has_remaining(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "page": 2,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)

    def test_category_filter_page1_has_next(self):
        response = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        self.assertIsNotNone(response.data["next"])

    def test_category_filter_page2_has_previous(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "page": 2,
        })
        self.assertIsNotNone(response.data["previous"])

    def test_tag_filter_page2(self):
        response = self.client.get(POST_LIST_URL, {
            "tag": self.python_tag.slug,
            "page": 2,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 25)

    def test_no_duplicate_posts_across_pages(self):
        """No post ID should appear on both page 1 and page 2."""
        r1 = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
        r2 = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug, "page": 2})
        ids_p1 = {r["id"] for r in r1.data["results"]}
        ids_p2 = {r["id"] for r in r2.data["results"]}
        self.assertEqual(ids_p1 & ids_p2, set())

    def test_page_size_param_respected(self):
        response = self.client.get(POST_LIST_URL, {
            "category": self.django_cat.slug,
            "page_size": 5,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 5)


class PostListQueryEfficiencyTests(TestCase):
    """
    Verify that taxonomy filtering does not introduce N+1 queries.

    We record the query count with a small set of posts and confirm it does
    not grow linearly when we double the matching posts.
    """

    _slug_counter = 0  # class-level counter for unique slugs across test runs

    def setUp(self):
        self.client = APIClient()
        self.author = make_user()
        self.django_cat = make_category("Django")

    def _make_unique_post(self, prefix="eff"):
        PostListQueryEfficiencyTests._slug_counter += 1
        n = PostListQueryEfficiencyTests._slug_counter
        return make_published_post(
            f"Efficiency {prefix} {n}",
            self.author,
            categories=[self.django_cat],
        )

    def test_query_count_does_not_scale_with_posts(self):
        """
        With 3 posts the query count equals the count with 6 posts (same page).
        Both sets fit on a single page to isolate pagination queries.
        """
        # Create 3 posts and measure queries
        for _ in range(3):
            self._make_unique_post("a")

        from django.test.utils import CaptureQueriesContext
        from django.db import connection

        with CaptureQueriesContext(connection) as ctx_3:
            r = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
            self.assertEqual(r.status_code, status.HTTP_200_OK)
        count_3 = len(ctx_3)

        # Add 3 more posts (total 6) and measure again
        for _ in range(3):
            self._make_unique_post("b")

        with CaptureQueriesContext(connection) as ctx_6:
            r = self.client.get(POST_LIST_URL, {"category": self.django_cat.slug})
            self.assertEqual(r.status_code, status.HTTP_200_OK)
        count_6 = len(ctx_6)

        # Query count must not grow linearly with post count (N+1 free).
        # Allow delta of 1 to accommodate any pagination count query variance.
        self.assertAlmostEqual(count_3, count_6, delta=1,
                               msg=f"Query count grew: 3 posts={count_3}, 6 posts={count_6}")
