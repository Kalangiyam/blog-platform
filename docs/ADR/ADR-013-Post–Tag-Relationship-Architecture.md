# ADR-013 — Post–Tag Relationship Architecture

## Status
* **Status:** Accepted
* **Date:** 2026-07-14
* **Feature:** Feature 09 — Post–Tag Relationship

---

# Context

The Tags domain was introduced in Feature 07 as a standalone taxonomy module responsible for classifying blog content and improving content discovery.

At that stage, Tags existed independently and were intentionally not connected to Posts. This incremental approach allowed the Tags domain to be designed, tested, and validated before introducing cross-domain relationships.

Feature 09 introduces the relationship between Posts and Tags, enabling authors to classify blog posts using one or more reusable Tags while preserving the modular architecture established throughout the project.

The relationship needed to satisfy the following business requirements:

* A Post may contain multiple Tags.
* A Tag may be assigned to multiple Posts.
* Tags should remain reusable across Posts.
* Tag assignment should use slug-based identifiers instead of database primary keys.
* Only active Tags should be assignable to new or updated Posts.
* Public API responses should include Tag information without requiring additional API requests.
* Relationship queries should scale efficiently for large datasets.
* Category and Tag validation should remain consistent.
* Duplicated taxonomy validation logic should be reduced without introducing premature abstraction.

---

# Decision

The following architectural decisions were adopted.

## 1. Many-to-Many Relationship

A bidirectional `ManyToManyField` was added between `Post` and `Tag`.

```python
tags = models.ManyToManyField(
    "tags.Tag",
    related_name="posts",
    blank=True,
    help_text="Tags used to classify this post.",
)
```

This allows:

* One Post → Many Tags
* One Tag → Many Posts

without duplicating Tag data.

Django automatically manages the relationship through an intermediate join table.

---

## 2. Slug-Based Relationship Assignment

The API accepts Tag slugs instead of database IDs.

Example request:

```json
{
    "title": "Introduction to Django REST Framework",
    "tag_slugs": [
        "django",
        "drf",
        "api"
    ]
}
```

Using slugs provides:

* Human-readable API requests
* Stable public identifiers
* Reduced exposure of internal database implementation
* Consistency with existing slug-based routing
* Consistency with the Post–Category relationship architecture

---

## 3. Serializer-Level Validation

Tag validation is performed within the serializers.

Validation rules include:

* Duplicate Tag slugs are rejected.
* Every supplied slug must exist.
* Only active Tags may be assigned.
* Valid slugs are converted into `Tag` model instances before persistence.

Keeping validation within serializers preserves the separation between HTTP handling, validation, and persistence.

The serializer also preserves the distinction between omitted fields and explicitly empty lists.

If `tag_slugs` is omitted during an update, existing Tag relationships remain unchanged.

If `tag_slugs` is supplied as an empty list, all Tag relationships are removed.

---

## 4. Nested Tag Representation

Post responses include lightweight nested Tag objects.

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

Only the fields required by clients are returned.

A dedicated nested serializer was introduced instead of reusing the Tags API serializer to reduce coupling between applications and minimize response size.

---

## 5. Shared Taxonomy Validation Mixin

Feature 08 and Feature 09 introduced the same validation pattern for Category and Tag assignment.

The repeated validation logic was extracted into:

```python
TaxonomyAssignmentMixin
```

The mixin is responsible for:

* Empty-list handling
* Duplicate slug detection
* Active taxonomy lookup
* Invalid or inactive taxonomy detection
* Conversion of slugs into model instances

The consuming serializers remain responsible for providing:

* The taxonomy model
* Duplicate validation messages
* Invalid or inactive validation messages

This approach reduces duplication while preserving explicit serializer behavior.

The mixin remains inside the Posts serializers package rather than being moved into the shared Core application because the abstraction is currently specific to Post taxonomy assignment.

---

## 6. Query Optimization

The `PostViewSet` uses:

```python
.prefetch_related(
    "categories",
    "tags",
)
```

to efficiently retrieve both taxonomy relationships.

This prevents the N+1 query problem when listing or retrieving Posts with related Categories and Tags.

The existing:

```python
.select_related("author")
```

optimization remains in place for the `author` foreign key.

---

## 7. Incremental Architecture

The relationship was introduced only after the Posts and Tags domains were independently completed and after the Post–Category relationship had established a reusable taxonomy pattern.

This incremental approach:

* Reduced implementation complexity
* Simplified testing
* Allowed each domain to evolve independently
* Preserved modular application boundaries
* Prevented premature abstraction
* Allowed shared validation logic to be extracted only after genuine duplication was confirmed

---

# Consequences

## Advantages

* Supports real-world Tag classification requirements.
* Enables reusable Tags across multiple Posts.
* Uses human-readable slug-based APIs.
* Provides frontend-friendly nested responses.
* Reduces unnecessary API requests.
* Prevents N+1 query performance issues.
* Preserves modular application architecture.
* Aligns with REST API best practices.
* Reduces duplicated taxonomy validation logic.
* Keeps Category and Tag assignment behavior consistent.
* Supports future search, filtering, and recommendation features.

---

## Trade-offs

* Many-to-many relationships require an additional join table.
* Serializer validation becomes more complex than simple model field validation.
* Nested serialization slightly increases response size.
* Relationship updates require explicit synchronization using `set()`.
* Shared mixins introduce an additional abstraction layer.
* The mixin requires serializers to provide model and error-message configuration explicitly.

These trade-offs are acceptable given the improved flexibility, consistency, performance, and maintainability.

---

# Related Features

* Feature 04 — Posts Domain Architecture & Database Design
* Feature 06 — Categories
* Feature 07 — Tags
* Feature 08 — Post–Category Relationship
* Feature 09 — Post–Tag Relationship

---

# Future Considerations

Future enhancements may include:

* Filtering Posts by Tag slug.
* Tag-based archive endpoints.
* Tag usage statistics.
* Popular Tag reporting.
* Related Post recommendations using shared Tags.
* Tag ordering through a custom intermediate model if business requirements evolve.
* Search by Tag.
* Automated tests for `TaxonomyAssignmentMixin`.
* Query-count regression tests for taxonomy prefetching.
* Moving shared taxonomy logic to a broader reusable layer only if another domain requires the same behavior.

---

# Alternatives Considered

## ForeignKey

Rejected because each Post would be limited to a single Tag, which does not satisfy common blog classification requirements.

---

## Database ID-Based Assignment

Rejected because exposing database primary keys creates tighter coupling between API consumers and the database schema.

Slug-based assignment provides a cleaner and more stable public API.

---

## Reusing the Tags API Serializer

Rejected because it would unnecessarily couple the Posts and Tags applications and expose additional fields that are not required in nested Post responses.

A dedicated lightweight nested serializer provides better separation of concerns and improves response efficiency.

---

## Keeping Duplicate Category and Tag Validation

Rejected because Feature 09 confirmed that Category and Tag assignment use the same validation algorithm.

Maintaining separate validation implementations would increase duplication, maintenance cost, and the risk of inconsistent behavior.

---

## Moving the Mixin to the Core Application

Rejected because the validation abstraction is currently specific to Post taxonomy assignment.

Moving it into the shared Core application would make the component appear globally reusable before another domain actually requires it.

Keeping the mixin inside the Posts serializers package follows YAGNI and preserves clear domain ownership.
