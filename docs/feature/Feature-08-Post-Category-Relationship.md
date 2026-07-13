# Feature 08 — Post–Category Relationship

## Feature Summary

Implements the relationship between blog posts and categories for the Production-Grade Blog Platform using Django REST Framework.

This feature enables authors to organize posts into one or more reusable categories while maintaining a scalable, production-ready architecture.

The implementation introduces a bidirectional many-to-many relationship, slug-based category assignment, serializer-level validation, nested category representations in API responses, and optimized database queries using `prefetch_related()`.

---

# Business Problem

Previously, posts and categories existed as independent domains.

Although categories could be managed through their own API, they could not be associated with posts, making content organization impossible.

Real-world blogging platforms require:

- A post to belong to multiple categories.
- A category to organize multiple posts.
- Human-readable category assignment.
- Efficient category retrieval.
- Frontend-friendly API responses.

This feature solves those requirements while preserving the modular architecture established in previous features.

---

# Architecture Summary

The implementation follows the existing project architecture:

- API-First Design
- Modular Django Applications
- Vertical Slice Development
- Action-Specific Serializers
- GenericViewSet + Explicit Mixins
- Backend Validation
- Backend Authorization
- Slug-Based Routing
- Nested Resource Representation
- Query Optimization using `prefetch_related()`

The relationship is implemented using Django's `ManyToManyField`, allowing posts and categories to remain independently managed while supporting reusable taxonomy.

---

# Database Changes

## Post Model

Added:

```python
categories = models.ManyToManyField(
    Category,
    related_name="posts",
    blank=True,
    help_text="Categories used to organize this post.",
)
```

Django automatically created the intermediate join table during migration.

No existing tables required modification beyond the new relationship.

---

# Models

## Updated

### Post

Added:

- `categories`

Relationship:

```
Post
    ↔
ManyToMany
    ↔
Category
```

---

# Managers

No manager changes were required.

The existing custom managers continue to function correctly.

---

# Serializers

## Created

### PostCategorySerializer

Purpose:

Provides a lightweight nested representation of categories within post responses.

Returned fields:

- `name`
- `slug`

---

## Updated

### PostCreateSerializer

Added:

- `category_slugs`
- Category slug validation
- Category assignment during post creation

---

### PostUpdateSerializer

Added:

- `category_slugs`
- Category slug validation
- Category synchronization during updates

Supports:

- Updating categories
- Clearing categories
- Leaving categories unchanged when omitted

---

### PostListSerializer

Added nested category representation.

---

### PostDetailSerializer

Added nested category representation.

---

# Permissions

No permission changes were introduced.

Existing permission architecture remains:

## Public

- List published posts
- Retrieve published posts

## Authenticated Authors

- Create posts
- Update own posts
- Delete own posts
- Publish own posts
- Unpublish own posts

Category assignment is validated independently of permissions.

---

# ViewSet

Updated:

## Query Optimization

Added:

```python
.prefetch_related("categories")
```

while preserving:

```python
.select_related("author")
```

This prevents N+1 queries while maintaining efficient author loading.

---

# API Endpoints

No new endpoints were introduced.

Existing endpoints gained category support.

## Create

```
POST /api/posts/
```

Supports:

```json
{
    "category_slugs": [
        "django",
        "python"
    ]
}
```

---

## Update

```
PUT/PATCH /api/posts/{slug}/
```

Supports updating assigned categories.

---

## List

```
GET /api/posts/
```

Returns nested category objects.

---

## Retrieve

```
GET /api/posts/{slug}/
```

Returns nested category objects.

---

# Request Flow

```
Client

↓

PostViewSet

↓

PostCreateSerializer /
PostUpdateSerializer

↓

Validate category slugs

↓

Retrieve Category objects

↓

Save Post

↓

Assign categories

↓

Return PostDetailSerializer
```

---

# Response Flow

```
Database

↓

Post

↓

PostCategorySerializer

↓

PostListSerializer /
PostDetailSerializer

↓

JSON Response
```

---

# Security

Validation includes:

- Reject duplicate category slugs.
- Reject non-existent category slugs.
- Reject inactive categories.
- Prevent invalid relationships.

Permissions continue to be enforced at the ViewSet level.

Frontend validation is never trusted.

---

# Manual Testing

Verified:

- ✅ Create post without categories
- ✅ Create post with one category
- ✅ Create post with multiple categories
- ✅ Update categories
- ✅ Replace existing categories
- ✅ Clear all categories
- ✅ Update post without changing categories
- ✅ Reject invalid category slugs
- ✅ Reject inactive categories
- ✅ List endpoint returns nested categories
- ✅ Detail endpoint returns nested categories
- ✅ Permission enforcement remains unchanged

---

# Files Created

```
backend/apps/posts/serializers/nested.py
```

---

# Files Modified

```
backend/apps/posts/models.py

backend/apps/posts/serializers/create.py

backend/apps/posts/serializers/update.py

backend/apps/posts/serializers/list.py

backend/apps/posts/serializers/detail.py

backend/apps/posts/views.py

backend/apps/posts/migrations/0002_post_categories.py
```

---

# Documentation Updated

Created

- ADR-012 — Post–Category Relationship Architecture
- Feature 08 — Post–Category Relationship

Updated

- API-Specification.md
- Database-Design.md
- Project-Status.md

---

# Key Engineering Concepts

- Many-to-Many Relationships
- Taxonomy Design
- Slug-Based API Design
- Nested Serializers
- Action-Specific Serializers
- Serializer-Level Validation
- Separation of Concerns
- DRF ModelSerializer
- Query Optimization
- `prefetch_related()`
- `select_related()`
- N+1 Query Prevention

---

# Production Considerations

- Uses reusable taxonomy architecture.
- Optimized for large datasets.
- Supports future category filtering.
- Supports future category archive pages.
- Keeps API responses lightweight.
- Maintains modular application boundaries.
- Avoids exposing database primary keys.

---

# Common Mistakes Avoided

- Using `ForeignKey` instead of `ManyToManyField`
- Exposing database IDs in the public API
- Reusing the full Category serializer for nested responses
- Missing validation for inactive categories
- Allowing duplicate category slugs
- Forgetting `prefetch_related()`
- Performing category validation in the ViewSet
- Trusting frontend validation

---

# Interview Questions

1. Why is `ManyToManyField` appropriate for posts and categories?
2. Why use slugs instead of database IDs?
3. What is the N+1 query problem?
4. When should `prefetch_related()` be used?
5. What is the difference between `select_related()` and `prefetch_related()`?
6. Why use a nested serializer instead of returning only IDs?
7. Why perform validation in serializers rather than ViewSets?
8. Why should categories remain reusable across posts?

---

# Future Improvements

- Category filtering endpoint
- Category archive pages
- Category usage statistics
- Category ordering
- Shared taxonomy validation mixins after implementing the Post–Tag relationship
- API pagination with category filtering
- Search by category

---

# Lessons Learned

- Incremental architecture simplifies development and testing.
- Many-to-many relationships are the appropriate solution for reusable taxonomy.
- Slug-based APIs provide cleaner public interfaces.
- Nested serializers improve frontend developer experience.
- Query optimization is essential when introducing relationship fields.
- Validation belongs in serializers, while ViewSets remain responsible for request handling.

---

# Feature Status

**Status:** ✅ Completed

Feature 08 successfully introduces a scalable, production-ready relationship between Posts and Categories while preserving the project's architecture, coding standards, security model, and documentation-driven development workflow.