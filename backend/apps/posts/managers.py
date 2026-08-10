from django.contrib.postgres.search import (
    SearchQuery,
    SearchVector,
    SearchRank,
)

from apps.core.managers import (
    SoftDeleteManager,
    SoftDeleteQuerySet,
)

from apps.posts.choices import PostStatus
from apps.posts.constants import POST_SEARCH_CONFIG


class PostQuerySet(SoftDeleteQuerySet):
    """
    QuerySet providing reusable Post-specific database operations.
    """

    def published(self):
        """
        Return published posts only.
        """
        return self.filter(
            status=PostStatus.PUBLISHED,
        )

    def for_category(self, category_slug: str):
        """
        Filter posts by an active Category slug.

        Empty or whitespace-only slugs leave the queryset unchanged.
        Unknown or inactive category slugs return an empty queryset.
        """
        slug = category_slug.strip() if category_slug else ""
        if not slug:
            return self

        from apps.categories.models import Category

        if not Category.objects.filter(slug=slug).exists():
            return self.none()

        return self.filter(categories__slug=slug)

    def for_tag(self, tag_slug: str):
        """
        Filter posts by an active Tag slug.

        Empty or whitespace-only slugs leave the queryset unchanged.
        Unknown or inactive tag slugs return an empty queryset.
        """
        slug = tag_slug.strip() if tag_slug else ""
        if not slug:
            return self

        from apps.tags.models import Tag

        if not Tag.objects.filter(slug=slug).exists():
            return self.none()

        return self.filter(tags__slug=slug)

    def search(self, query):
        """
        Return posts matching the query, ordered by relevance.
        """

        search_vector = (
            SearchVector(
                "title",
                weight="A",
                config=POST_SEARCH_CONFIG,
            )
            + SearchVector(
                "excerpt",
                weight="B",
                config=POST_SEARCH_CONFIG,
            )
            + SearchVector(
                "content",
                weight="C",
                config=POST_SEARCH_CONFIG,
            )
        )

        search_query = SearchQuery(
            query,
            search_type="websearch",
            config=POST_SEARCH_CONFIG,
        )

        return (
            self.annotate(
                search_vector=search_vector,
                search_rank=SearchRank(
                    search_vector,
                    search_query,
                ),
            )
            .filter(
                search_vector=search_query,
            )
            .order_by(
                "-search_rank",
                "-published_at",
                "-created_at",
                "-pk",
            )
        )


class PostManager(SoftDeleteManager):
    """
    Default Post manager providing active Post-specific queries.
    """

    def get_queryset(self):
        """
        Return the active Post QuerySet.
        """
        return PostQuerySet(
            self.model,
            using=self._db,
        ).active()

    def published(self):
        """
        Return published, non-deleted posts.
        """
        return self.get_queryset().published()

    def for_category(self, category_slug: str):
        """
        Return active posts filtered by an active Category slug.
        """
        return self.get_queryset().for_category(category_slug)

    def for_tag(self, tag_slug: str):
        """
        Return active posts filtered by an active Tag slug.
        """
        return self.get_queryset().for_tag(tag_slug)

    def search(self, query):
        """
        Search active, non-deleted posts.
        """
        return self.get_queryset().search(query)
