# ADR-012 — Post–Category Relationship Architecture

## Status

- **Status:** Accepted
- **Date:** 2026-07-13
- **Feature:** Feature 08 — Post–Category Relationship

---

# Context

The Categories domain was introduced in Feature 06 as a standalone taxonomy module responsible for organizing blog content.

At that stage, categories existed independently and were intentionally not connected to posts. This incremental approach allowed the Categories domain to be designed, tested, and validated before introducing cross-domain relationships.

Feature 08 introduces the relationship between Posts and Categories, enabling authors to organize blog posts into one or more categories while preserving the modular architecture established throughout the project.

The relationship needed to satisfy the following business requirements:

- A post may belong to multiple categories.
- A category may contain multiple posts.
- Categories should remain reusable across posts.
- Category assignment should use slug-based identifiers instead of database primary keys.
- Public API responses should include category information without requiring additional API requests.
- Relationship queries should scale efficiently for large datasets.

---

# Decision

The following architectural decisions were adopted.

## 1. Many-to-Many Relationship

A bidirectional `ManyToManyField` was added between `Post` and `Category`.

```python
categories = models.ManyToManyField(
    Category,
    related_name="posts",
    blank=True,
    help_text="Categories used to organize this post.",
)
```

This allows:

- One post → Many categories
- One category → Many posts

without duplicating category data.

---

## 2. Slug-Based Relationship Assignment

The API accepts category slugs instead of database IDs.

Example request:

```json
{
    "title": "Introduction to Django",
    "category_slugs": [
        "django",
        "python"
    ]
}
```

Using slugs provides:

- Human-readable API requests
- Stable public identifiers
- Reduced exposure of internal database implementation
- Consistency with existing slug-based routing

---

## 3. Serializer-Level Validation

Category validation is performed within the serializers.

Validation rules include:

- Duplicate category slugs are rejected.
- Every supplied slug must exist.
- Only active categories may be assigned.
- Valid slugs are converted into `Category` model instances before persistence.

Keeping validation within serializers preserves the separation between HTTP handling, validation, and persistence.

---

## 4. Nested Category Representation

Post responses include lightweight nested category objects.

Example:

```json
{
    "title": "Introduction to Django",
    "slug": "introduction-to-django",
    "categories": [
        {
            "name": "Django",
            "slug": "django"
        },
        {
            "name": "Python",
            "slug": "python"
        }
    ]
}
```

Only the fields required by clients are returned.

A dedicated nested serializer was introduced instead of reusing the Categories API serializer to reduce coupling between applications and minimize response size.

---

## 5. Query Optimization

The `PostViewSet` uses:

```python
.prefetch_related("categories")
```

to efficiently retrieve category relationships.

This prevents the N+1 query problem when listing or retrieving posts with related categories.

The existing:

```python
.select_related("author")
```

optimization remains in place for the `author` foreign key.

---

## 6. Incremental Architecture

The relationship was introduced only after both the Posts and Categories domains were independently completed.

This incremental approach:

- Reduced implementation complexity
- Simplified testing
- Allowed each domain to evolve independently
- Preserved modular application boundaries

---

# Consequences

## Advantages

- Supports real-world blog taxonomy requirements.
- Enables reusable categories across multiple posts.
- Uses human-readable slug-based APIs.
- Provides frontend-friendly nested responses.
- Reduces unnecessary API requests.
- Prevents N+1 query performance issues.
- Preserves modular application architecture.
- Aligns with REST API best practices.

---

## Trade-offs

- Many-to-many relationships require an additional join table.
- Serializer validation becomes more complex than simple model field validation.
- Nested serialization slightly increases response size.
- Relationship updates require explicit synchronization using `set()`.

These trade-offs are acceptable given the improved flexibility and maintainability.

---

# Related Features

- Feature 04 — Posts Domain Architecture & Database Design
- Feature 06 — Categories
- Feature 08 — Post–Category Relationship

---

# Future Considerations

Future enhancements may include:

- Filtering posts by category slug.
- Category-based archive endpoints.
- Category usage statistics.
- Category ordering through a custom intermediate model if business requirements evolve.
- Shared taxonomy validation mixins after implementing the Post–Tag relationship in Feature 09.

---

# Alternatives Considered

## ForeignKey

Rejected because each post would be limited to a single category, which does not satisfy common blog taxonomy requirements.

---

## Database ID-Based Assignment

Rejected because exposing database primary keys creates tighter coupling between API consumers and the database schema.

Slug-based assignment provides a cleaner and more stable public API.

---

## Reusing the Categories API Serializer

Rejected because it would unnecessarily couple the Posts and Categories applications and expose additional fields that are not required in nested post responses.

A dedicated lightweight nested serializer provides better separation of concerns and improves response efficiency.