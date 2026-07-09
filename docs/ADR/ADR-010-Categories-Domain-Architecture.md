# ADR-010 — Categories Domain Architecture

## Status

* **Status:** Accepted
* **Date:** 2026-07-09
* **Feature:** Feature 06 — Categories

---

# Context

Feature 06 introduces the application's first reusable taxonomy domain through Categories.

Categories provide a consistent mechanism for organizing blog posts while remaining independent of the Posts domain. The implementation must support unique category names, SEO-friendly URLs, backend validation, and secure administration.

The architecture should also remain flexible enough to support future many-to-many relationships between Posts and Categories without requiring significant redesign.

---

# Decision

The Categories domain follows these architectural decisions:

## Dedicated Categories Application

Categories are implemented as a separate Django application.

Benefits:

* Clear separation of concerns
* Independent domain management
* Easier maintenance
* Consistent modular architecture
* Simplifies future feature expansion

---

## GenericViewSet with DRF Mixins

Category APIs are implemented using `GenericViewSet` combined with DRF Mixins instead of `ModelViewSet`.

Implemented operations:

* Create
* List
* Retrieve
* Update

Benefits:

* Explicit API behavior
* Better control over exposed operations
* Easier customization
* Consistent with the Posts architecture
* Supports long-term maintainability

---

## Action-Specific Serializers

Dedicated serializers are used for each API action.

Implemented serializers:

* `CategoryCreateSerializer`
* `CategoryListSerializer`
* `CategoryDetailSerializer`
* `CategoryUpdateSerializer`

Benefits:

* Single Responsibility Principle
* Clear separation of validation logic
* Smaller and more maintainable serializers
* Easier future extension

---

## Automatic Backend Slug Generation

Category slugs are generated automatically on the backend during creation.

Benefits:

* Consistent URL generation
* Prevents client-side manipulation
* Improves SEO
* Centralizes slug generation logic
* Ensures uniqueness

---

## Active Status Management

Categories inherit from `ActiveStatusModel` and use `ActiveStatusManager`.

Benefits:

* Only active categories are returned by default
* Centralized filtering logic
* Cleaner querysets
* Easier future category deactivation
* Reusable across future taxonomy models

---

## Backend Permission Enforcement

Category management permissions are enforced entirely on the backend.

Implemented permissions:

* Public users can list and retrieve categories.
* Only staff users can create and update categories.

Benefits:

* Prevents unauthorized modifications
* Consistent authorization model
* Simplifies future role expansion
* Never relies on frontend validation

---

# Consequences

Positive:

* Independent taxonomy domain
* Reusable architecture
* Stable slug-based URLs
* Backend-controlled validation
* Consistent serializer architecture
* Scalable permission model
* Easy future integration with Posts

Trade-offs:

* Additional serializers to maintain
* Separate CRUD implementation
* Future feature required for Post–Category relationships

These trade-offs are acceptable because they preserve clean architecture and support incremental development.

---

# Related Features

* Feature 04 — Posts Domain Architecture & Database Design
* Feature 05 — Publishing Workflow
* Feature 06 — Categories
* Feature 07 — Tags (planned)
* Future Post–Category Relationship (planned)