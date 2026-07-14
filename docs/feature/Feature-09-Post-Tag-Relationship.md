# Feature 09 — Post–Tag Relationship

## Feature Summary

Implements the relationship between blog posts and tags for the Production-Grade Blog Platform using Django REST Framework.

This feature enables authors to classify posts using one or more reusable tags while preserving the scalable taxonomy architecture established by the Post–Category relationship.

The implementation introduces a bidirectional many-to-many relationship, slug-based tag assignment, serializer-level validation, nested tag representations in API responses, optimized database queries using `prefetch_related()`, and shared taxonomy validation through a reusable serializer mixin.

---

# Business Problem

Previously, Posts and Tags existed as independent domains.

Although tags could be created and managed through the Tags API, they could not be associated with posts. This prevented tags from supporting their primary business purpose: flexible content classification and discovery.

Real-world blogging platforms require:

* A post to contain multiple tags.
* A tag to be reused across multiple posts.
* Human-readable tag assignment.
* Validation of inactive and invalid tags.
* Efficient tag retrieval.
* Frontend-friendly nested tag responses.
* Consistent behavior across category and tag relationships.

Feature 08 implemented the first taxonomy relationship using Categories.

Feature 09 extends that architecture to Tags and removes duplicated taxonomy validation logic between category and tag assignment.

---

# Architecture Summary

The implementation follows the existing project architecture:

* API-First Design
* Modular Django Applications
* Vertical Slice Development
* Action-Specific Serializers
* GenericViewSet + Explicit Mixins
* Backend Validation
* Backend Authorization
* Slug-Based Routing
* Nested Resource Representation
* Query Optimization using `prefetch_related()`
* Shared Serializer Mixins
* Separation of Read and Write Representations

The relationship is implemented using Django's `ManyToManyField`, allowing Posts and Tags to remain independently managed while supporting reusable taxonomy assignment.

The Post–Tag implementation intentionally follows the same public API contract and database architecture established by the Post–Category relationship.

Shared category and tag validation logic is extracted into `TaxonomyAssignmentMixin` only after both relationships demonstrated the same stable validation pattern.

This avoids premature abstraction while reducing verified duplication.

---

# Database Changes

## Post Model

Added:

```python
tags = models.ManyToManyField(
    "tags.Tag",
    related_name="posts",
    blank=True,
    help_text="Tags used to classify this post.",
)
```

Django automatically created an intermediate join table during migration.

The relationship does not add a nullable `tag_id` column to the Post table. Instead, each Post–Tag association is stored as a separate row in the generated join table.

Existing posts remain valid because the relationship is optional through:

```python
blank=True
```

No data migration was required.

---

# Models

## Updated

### Post

Added:

* `tags`

Relationship:

```text
Post
    ↔
ManyToMany
    ↔
Tag
```

A post may contain zero or more tags.

A tag may be assigned to zero or more posts.

The reverse relationship is available through:

```python
tag.posts.all()
```

---

# Managers

No manager changes were required.

The existing Post and Tag managers continue to function correctly.

Active Tag filtering remains controlled by the existing Tag domain manager and serializer validation.

Post query behavior continues to exclude soft-deleted records through the existing lifecycle architecture.

---

# Serializers

## Created

### PostTagSerializer

Purpose:

Provides a lightweight nested representation of Tags within Post responses.

Returned fields:

* `name`
* `slug`

The lightweight serializer avoids exposing unnecessary Tag administration fields and keeps Post API responses frontend-friendly.

---

### TaxonomyAssignmentMixin

Purpose:

Provides reusable validation behavior for slug-based taxonomy assignment.

The mixin handles:

* Empty taxonomy lists
* Duplicate slug detection
* Active taxonomy lookup
* Invalid or inactive taxonomy detection
* Conversion of submitted slugs into model instances

The serializer using the mixin remains responsible for providing:

* The taxonomy model
* Duplicate validation messages
* Invalid or inactive validation messages

This keeps the reusable algorithm generic without hiding domain-specific configuration.

---

## Updated

### PostCreateSerializer

Added:

* `tag_slugs`
* Tag slug validation
* Tag assignment during Post creation
* Shared taxonomy validation through `TaxonomyAssignmentMixin`

The serializer accepts:

```json
{
    "tag_slugs": [
        "django",
        "python"
    ]
}
```

The submitted slugs are validated and converted into active Tag instances before the Post–Tag relationships are created.

The serializer continues supporting optional category and tag assignment.

---

### PostUpdateSerializer

Added:

* `tag_slugs`
* Tag slug validation
* Tag synchronization during Post updates
* Shared taxonomy validation through `TaxonomyAssignmentMixin`

Supports:

* Adding tags
* Replacing tags
* Clearing tags
* Leaving tags unchanged when omitted
* Updating categories without changing tags
* Updating tags without changing categories

The update serializer distinguishes between an omitted field and an explicitly empty list.

Field omitted:

```json
{
    "title": "Updated title"
}
```

Behavior:

```text
Existing tags remain unchanged.
```

Empty list supplied:

```json
{
    "tag_slugs": []
}
```

Behavior:

```text
All assigned tags are removed.
```

---

### PostListSerializer

Added nested Tag representation.

Post list responses now include lightweight nested Category and Tag objects.

---

### PostDetailSerializer

Added nested Tag representation.

Post detail responses now expose complete taxonomy information without requiring additional API requests.

---

### PostCreateSerializer and PostUpdateSerializer

Refactored category and tag validation to use:

```python
TaxonomyAssignmentMixin
```

The refactor preserves the existing API behavior while reducing duplicated validation logic.

---

# Permissions

No permission changes were introduced.

Existing permission architecture remains:

## Public

* List published posts
* Retrieve published posts
* List active tags
* Retrieve active tags

## Authenticated Authors

* Create posts
* Assign active tags during Post creation
* Update tags on their own posts
* Remove tags from their own posts
* Update their own posts
* Delete their own posts
* Publish their own posts
* Unpublish their own posts

## Staff Users

* Create Tags
* Update Tags
* Manage Tag lifecycle state

Tag assignment is part of Post creation and update operations.

Existing object-level ownership permissions therefore protect Tag relationship changes.

The Posts API may reference existing Tags but cannot create or modify Tag records implicitly.

---

# ViewSet

## Query Optimization

Updated the Post queryset from category-only prefetching to:

```python
.select_related("author")
.prefetch_related(
    "categories",
    "tags",
)
```

`select_related("author")` is used because `author` is a foreign-key relationship.

`prefetch_related("categories", "tags")` is used because Categories and Tags are many-to-many relationships.

This prevents N+1 queries when serializing multiple Posts with their related Categories and Tags.

No new ViewSet actions were required.

The existing Post endpoints gained Tag relationship support through serializer changes.

---

# API Endpoints

No new endpoints were introduced.

Existing Post endpoints gained Tag support.

## Create

```text
POST /api/posts/
```

Supports:

```json
{
    "title": "Introduction to Django REST Framework",
    "excerpt": "Learn how to build APIs with Django REST Framework.",
    "content": "Full article content...",
    "category_slugs": [
        "backend"
    ],
    "tag_slugs": [
        "django",
        "drf",
        "api"
    ]
}
```

Authentication:

```text
JWT Access Token required
```

Successful status:

```text
201 Created
```

---

## Update

```text
PATCH /api/posts/{slug}/
```

Supports updating assigned Tags:

```json
{
    "tag_slugs": [
        "django",
        "python"
    ]
}
```

Supports clearing Tags:

```json
{
    "tag_slugs": []
}
```

If `tag_slugs` is omitted, existing Tag relationships remain unchanged.

Authentication:

```text
JWT Access Token required
```

Permission:

```text
Post author only
```

Successful status:

```text
200 OK
```

---

## List

```text
GET /api/posts/
```

Returns nested Tag objects.

Example:

```json
{
    "title": "Introduction to Django REST Framework",
    "slug": "introduction-to-django-rest-framework",
    "tags": [
        {
            "name": "Django",
            "slug": "django"
        },
        {
            "name": "DRF",
            "slug": "drf"
        }
    ]
}
```

---

## Retrieve

```text
GET /api/posts/{slug}/
```

Returns nested Tag objects alongside nested Category objects.

---

# Request Flow

```text
Client

↓

PostViewSet

↓

JWT Authentication

↓

Object-Level Permission Validation

↓

PostCreateSerializer /
PostUpdateSerializer

↓

Validate Post fields

↓

validate_tag_slugs()

↓

TaxonomyAssignmentMixin

↓

Reject duplicate slugs

↓

Retrieve active Tag objects

↓

Reject invalid or inactive Tags

↓

Create or update Post

↓

Synchronize Post–Tag relationships

↓

Django ORM

↓

PostgreSQL

↓

Return PostDetailSerializer
```

---

# Response Flow

```text
PostgreSQL

↓

Django ORM

↓

Post queryset with
select_related("author") and
prefetch_related("categories", "tags")

↓

PostCategorySerializer /
PostTagSerializer

↓

PostListSerializer /
PostDetailSerializer

↓

JSON Response

↓

Client
```

---

# Security

Validation includes:

* Reject duplicate Tag slugs.
* Reject non-existent Tag slugs.
* Reject inactive Tags.
* Prevent invalid Post–Tag relationships.
* Enforce Post ownership before relationship updates.
* Prevent the Posts API from creating Tag records implicitly.
* Prevent the Posts API from modifying Tag records implicitly.
* Preserve existing relationships when `tag_slugs` is omitted.
* Clear relationships only when an explicit empty list is supplied.

Authentication and authorization continue to be enforced through the Post ViewSet and existing permission classes.

Tag administration remains restricted to staff users.

Tag assignment does not bypass Post ownership restrictions.

Frontend validation is never trusted.

---

# Manual Testing

Verified:

* ✅ Create Post without Tags
* ✅ Create Post with one Tag
* ✅ Create Post with multiple Tags
* ✅ Create Post with Categories and Tags
* ✅ Update Tags
* ✅ Replace existing Tags
* ✅ Clear all Tags
* ✅ Update Post without changing Tags
* ✅ Update Categories while preserving Tags
* ✅ Update Tags while preserving Categories
* ✅ Reject invalid Tag slugs
* ✅ Reject inactive Tags
* ✅ Reject duplicate Tag slugs
* ✅ List endpoint returns nested Tags
* ✅ Detail endpoint returns nested Tags
* ✅ Tag reuse across multiple Posts
* ✅ Existing Category validation remains unchanged
* ✅ Shared taxonomy mixin validates Categories correctly
* ✅ Shared taxonomy mixin validates Tags correctly
* ✅ Permission enforcement remains unchanged
* ✅ Query optimization includes Categories and Tags

---

# Files Created

```text
backend/apps/posts/serializers/mixins.py

backend/apps/posts/migrations/0003_post_tags.py
```

### `backend/apps/posts/serializers/mixins.py`

Contains reusable validation behavior for slug-based Category and Tag assignment.

### `backend/apps/posts/migrations/0003_post_tags.py`

Adds the Post–Tag many-to-many relationship and creates the automatic intermediate join table.

---

# Files Modified

```text
backend/apps/posts/models.py

backend/apps/posts/serializers/create.py

backend/apps/posts/serializers/update.py

backend/apps/posts/serializers/list.py

backend/apps/posts/serializers/detail.py

backend/apps/posts/serializers/nested.py

backend/apps/posts/views.py
```

---

# Documentation Updated

## Created

* ADR-013 — Post–Tag Relationship Architecture
* Feature 09 — Post–Tag Relationship

## Updated

* README.md
* API-Specification.md
* Architecture.md
* Authentication-Flow.md
* Database-Design.md
* Testing-Strategy.md
* Project-Status.md

## Unchanged

No unrelated project documentation was changed.

---

# Key Engineering Concepts

* Many-to-Many Relationships
* Reusable Taxonomy Architecture
* Slug-Based API Design
* Nested Serializers
* Action-Specific Serializers
* Serializer-Level Validation
* Shared Serializer Mixins
* Method Resolution Order
* DRY Principle
* KISS Principle
* YAGNI Principle
* Separation of Concerns
* DRF `ModelSerializer`
* Relationship Synchronization
* Query Optimization
* `prefetch_related()`
* `select_related()`
* N+1 Query Prevention
* Backend-Enforced Ownership
* Active Status Lifecycle

---

# Production Considerations

* Uses normalized many-to-many relationship tables.
* Supports reuse of Tags across many Posts.
* Preserves independent Posts and Tags domain boundaries.
* Avoids exposing database primary keys through assignment requests.
* Rejects inactive Tags during new relationship assignment.
* Preserves existing relationships when Tags later become inactive.
* Keeps nested Tag responses lightweight.
* Optimizes relationship loading for large Post collections.
* Reduces duplicate serializer validation through a shared mixin.
* Preserves backward compatibility for existing Posts.
* Requires no data migration because Tags are optional.
* Supports future Tag filtering and archive pages.
* Supports future search and recommendation features.
* Keeps Tag management separate from Tag assignment.

---

# Common Mistakes Avoided

* Using `ForeignKey` instead of `ManyToManyField`
* Adding `null=True` to a many-to-many field
* Exposing database IDs in the public API
* Reusing the full Tag serializer for nested responses
* Missing validation for inactive Tags
* Allowing duplicate Tag slugs
* Treating omitted Tag fields the same as empty lists
* Clearing Tags unintentionally during partial updates
* Forgetting `prefetch_related("tags")`
* Using `select_related()` for a many-to-many relationship
* Performing Tag validation inside the ViewSet
* Allowing the Posts API to create Tags implicitly
* Trusting frontend validation
* Creating the shared mixin before the repeated pattern was confirmed
* Over-generalizing the taxonomy mixin

---

# Interview Questions

1. Why is `ManyToManyField` appropriate for Posts and Tags?
2. Why should Tags remain independent from the Posts application?
3. Why use Tag slugs instead of database IDs for relationship assignment?
4. What is the difference between omitting `tag_slugs` and submitting an empty list?
5. Why is `prefetch_related()` required for Tags?
6. What is the difference between `select_related()` and `prefetch_related()`?
7. Why use a lightweight nested Tag serializer?
8. Why was shared taxonomy validation extracted only after Feature 09?
9. How does Python find methods inherited from `TaxonomyAssignmentMixin`?
10. What is the Method Resolution Order?
11. Why should the Posts API not create or update Tag records implicitly?
12. How does the backend prevent inactive Tags from being assigned?
13. What database table does Django create for a many-to-many relationship?
14. How does the implementation preserve existing Tags during partial updates?
15. What security vulnerability could occur if Post ownership were not checked before updating Tags?

---

# Future Improvements

* Tag filtering endpoint
* Tag archive pages
* Tag usage statistics
* Tag ordering
* Popular Tag reporting
* Related Post recommendations using shared Tags
* Search by Tag
* API pagination with Tag filtering
* Automated tests for `TaxonomyAssignmentMixin`
* Automated Post–Tag relationship tests
* Query-count regression tests
* Bulk Tag assignment
* Tag autocomplete support
* Database constraints for future custom intermediate models
* Caching frequently accessed taxonomy data

---

# Lessons Learned

* A many-to-many relationship is the correct design for reusable Tags.
* Category and Tag relationships can share a consistent taxonomy architecture.
* Slug-based assignment produces a readable and stable public API.
* Nested serializers improve frontend usability without exposing unnecessary fields.
* Omitted relationship fields and empty relationship lists represent different update intentions.
* Shared mixins should be introduced only after genuine repeated behavior is confirmed.
* A mixin should own reusable algorithms while serializers provide domain-specific configuration.
* Query optimization must be updated whenever new serialized relationships are introduced.
* `prefetch_related()` is required for many-to-many relationships.
* Validation belongs in serializers and shared serializer components rather than ViewSets.
* Backend ownership enforcement must protect relationship changes.
* Refactoring is successful only when existing external behavior remains unchanged.

---

# Feature Status

**Status:** ✅ Completed

Feature 09 successfully introduces a scalable, production-ready relationship between Posts and Tags while preserving the project's modular architecture, ownership-based security, slug-based API design, active taxonomy lifecycle, and documentation-driven development workflow.

The feature also completes the initial reusable taxonomy architecture by supporting both Post–Category and Post–Tag relationships through consistent database design, nested API responses, optimized query loading, and shared serializer validation.
