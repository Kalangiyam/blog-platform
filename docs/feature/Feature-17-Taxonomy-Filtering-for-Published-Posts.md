# Feature 17 — Taxonomy Filtering for Published Posts

## Feature Summary

Backend Feature 17 extends the existing public published-post collection with optional Category and Tag slug filters. It introduces no new endpoint and preserves the existing pagination envelope, serializer contract, visibility rules, permissions, and eager-loading behavior.

**Status:** Complete

## Business Purpose

Readers need to discover published content by taxonomy without downloading the entire collection or relying on frontend-only filtering. The backend now applies taxonomy constraints authoritatively while preserving the established public-post visibility boundary.

## Architecture Summary

The feature follows the existing Posts architecture:

- `PostQuerySet` owns reusable taxonomy-filtering behavior.
- `PostManager` explicitly forwards the new QuerySet methods, matching the existing manager design.
- `PostViewSet` reads HTTP query parameters and composes the domain methods.
- The existing `GET /api/posts/` endpoint, pagination, serializers, and permissions remain unchanged.

No new architectural pattern was introduced.

## Request Flow

```text
GET /api/posts/?category=django&tag=python
    → PostViewSet reads category and tag
    → Post.objects.published() establishes visibility
    → for_category("django")
    → for_tag("python")
    → eager loading remains applied
    → pagination
    → PostListSerializer
    → 200 OK paginated response
```

## Response Flow

Successful filtered and unfiltered requests use the existing response contract:

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

Unknown or inactive taxonomy slugs are ordinary collection constraints and therefore return `200 OK` with an empty paginated collection rather than `404 Not Found`.

## Data Flow

The base queryset excludes soft-deleted records through the normal Post manager and excludes drafts through `.published()`. Optional Category and Tag constraints are then chained. Combined parameters use logical AND semantics because both QuerySet filters apply to the same queryset.

Empty and whitespace-only values are normalized to no constraint, so they leave the current queryset unchanged.

## Files Created/Modified

### Created

- `backend/apps/posts/tests/__init__.py`
- `backend/apps/posts/tests/test_post_taxonomy_filtering.py`
- `docs/feature/Feature-17-Taxonomy-Filtering-for-Published-Posts.md`

### Modified

- `backend/apps/posts/managers.py`
- `backend/apps/posts/views.py`
- `docs/API-Specification.md`
- `docs/Architecture.md` — Taxonomy Filtering Architecture section only
- `docs/Testing-Strategy.md`

### Replaced

- Removed the empty placeholder `backend/apps/posts/tests.py` after converting Posts tests to a package.

## Models

No model changed. Existing `Post.categories` and `Post.tags` many-to-many relationships are reused.

## Database Changes

No schema change or migration was required.

Existing unique slug indexes and Django-managed many-to-many indexes support the filtering paths. No speculative index was added.

## API Changes

The public collection accepts these optional parameters:

```http
GET /api/posts/?category=django
GET /api/posts/?tag=python
GET /api/posts/?category=django&tag=python
```

Behavior:

- `category` matches an active Category slug.
- `tag` matches an active Tag slug.
- Combined filters use logical AND.
- Unknown or inactive slugs return an empty paginated collection.
- Empty or whitespace-only values are ignored.
- Existing `page` and `page_size` behavior is preserved.

## QuerySet / Manager Design

`PostQuerySet.for_category()` and `PostQuerySet.for_tag()` normalize the supplied slug, enforce active-taxonomy existence through the taxonomy's default active manager, and return either a chainable constrained queryset or `self.none()`.

Filtering belongs in the QuerySet because it is reusable domain/query behavior independent of HTTP. Keeping it there prevents duplicated relationship logic in views and allows safe composition with `.published()` and other QuerySet operations.

`PostManager` extends the existing custom soft-delete manager rather than a manager generated with `Manager.from_queryset()`. Explicit `for_category()` and `for_tag()` forwarding methods therefore preserve the established manager pattern.

## Permissions

Permissions did not change. `GET /api/posts/` remains publicly readable, and backend queryset visibility remains authoritative. Frontend controls or filtering are not a security boundary.

## Security

- Draft posts are excluded by `.published()` before taxonomy constraints are returned.
- Soft-deleted posts are excluded by the normal Post manager.
- Inactive Category and Tag slugs are rejected as public filter matches through their active-only managers.
- Unknown filters cannot expose alternate querysets or resource details.
- The feature does not modify write permissions, ownership rules, serializers, or authentication.

## Performance

- `select_related("author")` remains in the public list path.
- `prefetch_related("categories", "tags")` remains in the public list path.
- Active-taxonomy validation uses `.exists()` and does not load model instances.
- Query-efficiency testing confirms that doubling matching posts on one page does not cause query growth.
- Unique taxonomy slug indexes and existing M2M indexes are reused.
- `.distinct()` was not added because the filtered relationships and unique slugs do not produce duplicate Post rows in the verified query shape.
- No new schema, cache, or speculative database index was introduced.

## Testing Coverage

The dedicated module contains 76 tests across nine test classes. Coverage includes:

- Category and Tag QuerySet filtering
- QuerySet chaining
- Combined logical AND behavior
- Unknown and inactive slugs
- Empty and whitespace-only values
- Draft and soft-delete exclusion
- Existing unfiltered list regression
- Pagination and `page_size`
- Deterministic ordering
- Duplicate-result prevention within and across pages
- Nested author/category/tag representations
- Stable query count as matching collection size increases

Verified result on 2026-08-10: 76 tests passed, with 0 failures and 0 errors.

## Key Concepts

- QuerySet encapsulation keeps reusable query rules in the domain/query layer.
- Manager forwarding exposes custom QuerySet behavior consistently.
- Collection filters constrain results; they do not identify one required resource.
- Many-to-many filters can be composed naturally through Django QuerySets.
- Sequential Category and Tag filters provide logical AND semantics.
- Visibility must be established by the backend before optional discovery filters are applied.

## Common Mistakes

- Filtering an already-downloaded collection only in React.
- Starting from an unrestricted queryset and accidentally exposing drafts.
- Returning `404` for an unmatched collection filter.
- Duplicating taxonomy query logic inside the ViewSet.
- Adding separate Category/Tag post-list endpoints without a requirement.
- Forgetting pagination behavior when filters are active.
- Adding `.distinct()` or indexes without evidence that they are needed.
- Treating frontend visibility controls as authorization.

## Interview Questions

1. Why should reusable taxonomy filters live on a custom QuerySet instead of directly in a DRF ViewSet?
2. How does chaining `for_category()` and `for_tag()` produce AND semantics?
3. Why does an unknown collection-filter slug return an empty `200 OK` response instead of `404`?
4. How do Django's default managers help enforce active-taxonomy visibility?
5. Why must `.published()` and soft-delete scoping remain authoritative regardless of query parameters?
6. When is `.distinct()` needed for many-to-many filtering, and why was it not added here?
7. How do `select_related()` and `prefetch_related()` prevent N+1 behavior in this response shape?
8. Why are explicit manager forwarding methods required in this repository's manager design?

## Refactoring Opportunities

No refactoring is required for Feature 17. If additional public collection filters are introduced later, a validated filter serializer or a dedicated filter backend may become worthwhile. That decision should be driven by demonstrated parameter complexity rather than introduced speculatively.

## Final Verification

Executed from `backend/` with the repository virtual environment:

```powershell
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py test apps.posts.tests.test_post_taxonomy_filtering --verbosity=2
```

Results:

- Django system check: no issues, 0 silenced.
- Tests discovered: 76.
- Tests passed: 76.
- Failures: 0.
- Errors: 0.
- Test database: PostgreSQL `test_blog_platform` created and destroyed successfully.
- Test duration reported by Django: 87.639 seconds.

## ADR Decision

**ADR required:** No

**Reason:** Feature 17 extends the established `PostQuerySet`, custom manager, public collection-filtering, pagination, and visibility architecture. It introduces no new architectural decision.
