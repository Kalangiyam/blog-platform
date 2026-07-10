# ADR-011 — Tags Domain Architecture

## Status

* **Status:** Accepted
* **Date:** 2026-07-10
* **Feature:** Feature 07 — Tags

---

# Context

Feature 07 introduces the application's second reusable taxonomy domain through Tags.

Tags provide a flexible mechanism for labeling and classifying blog posts using descriptive keywords. Unlike Categories, which represent a primary classification, Tags allow multiple labels to be associated with a post in a future feature.

The Tags domain is implemented independently from the Posts domain to establish reusable taxonomy management before introducing the future many-to-many relationship between Posts and Tags.

The implementation must support unique tag names, SEO-friendly URLs, backend validation, and secure administration while remaining consistent with the architecture established by the Categories domain.

---

# Decision

The Tags domain follows these architectural decisions:

## Dedicated Tags Application

Tags are implemented as a separate Django application.

Benefits:

* Clear separation of concerns
* Independent domain management
* Easier maintenance
* Consistent modular architecture
* Simplifies future feature expansion

---

## GenericViewSet with DRF Mixins

Tag APIs are implemented using `GenericViewSet` combined with DRF Mixins instead of `ModelViewSet`.

Implemented operations:

* Create
* List
* Retrieve
* Update

Benefits:

* Explicit API behavior
* Better control over exposed operations
* Easier customization
* Consistent with the Posts and Categories architecture
* Supports long-term maintainability

---

## Action-Specific Serializers

Dedicated serializers are used for each API action.

Implemented serializers:

* `TagCreateSerializer`
* `TagReadSerializer`
* `TagUpdateSerializer`

Benefits:

* Single Responsibility Principle
* Clear separation of validation logic
* Smaller and more maintainable serializers
* Easier future extension

---

## Automatic Backend Slug Generation

Tag slugs are generated automatically on the backend during creation.

Benefits:

* Consistent URL generation
* Prevents client-side manipulation
* Improves SEO
* Centralizes slug generation logic
* Ensures stable resource identifiers

---

## Active Status Management

Tags inherit from `ActiveStatusModel` and use `ActiveStatusManager`.

Benefits:

* Only active tags are returned by default
* Centralized filtering logic
* Cleaner querysets
* Easier future tag deactivation
* Reusable across taxonomy models

---

## Backend Permission Enforcement

Tag management permissions are enforced entirely on the backend.

Implemented permissions:

* Public users can list and retrieve tags.
* Only staff users can create and update tags.

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
* Future feature required for Post–Tag many-to-many relationships

These trade-offs are acceptable because they preserve clean architecture and support incremental development.

---

# Related Features

* Feature 04 — Posts Domain Architecture & Database Design
* Feature 06 — Categories
* Feature 07 — Tags
* Feature 08 — Post–Category Relationship (planned)
* Feature 09 — Post–Tag Relationship (planned)