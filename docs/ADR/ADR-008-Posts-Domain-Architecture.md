# ADR-008 — Posts Domain Architecture

## Status

- **Status:** Accepted
- **Date:** 2026-07-06
- **Feature:** Feature 04 — Posts Domain Architecture & Database Design

---

# Context

Feature 04 introduces the first business domain of the application.

The Posts module must support scalable CRUD operations while remaining maintainable, secure, and extensible for future publishing workflows, categories, tags, comments, and role-based permissions.

---

# Decision

The Posts domain follows these architectural decisions:

## Separate Django App

Posts are implemented as an independent Django application.

Benefits:

- Modular architecture
- Clear separation of concerns
- Easier maintenance
- Independent testing
- Future scalability

---

## ViewSet + DRF Mixins

The API uses `GenericViewSet` combined with mixins instead of a full `ModelViewSet`.

Benefits:

- Explicitly exposes only required actions
- Avoids unnecessary endpoints
- Better control over permissions
- Easier customization

---

## Action-Specific Serializers

Separate serializers are used for:

- Create
- List
- Retrieve
- Update

Benefits:

- Single Responsibility Principle
- Smaller serializers
- Different validation rules per action
- Easier maintenance

---

## Slug-Based Routing

Posts are identified by slug instead of numeric ID.

Benefits:

- Human-readable URLs
- SEO-friendly endpoints
- Stable public identifiers
- Better frontend usability

---

## Soft Delete

Posts are never permanently deleted through the API.

Benefits:

- Data recovery
- Auditability
- Future moderation features
- Preserved relationships

---

## Object-Level Permissions

Ownership is enforced using a custom `IsPostAuthor` permission.

Benefits:

- Backend-enforced authorization
- Prevents unauthorized modifications
- Supports future role-based permissions

---

## Audit Fields

Models inherit audit fields from shared abstract base classes.

Tracked fields include:

- created_by
- updated_by
- deleted_by
- created_at
- updated_at
- deleted_at

Benefits:

- Traceability
- Easier debugging
- Administrative auditing

---

# Consequences

Positive:

- Highly maintainable architecture
- Strong security
- Easy extensibility
- Consistent coding patterns

Trade-offs:

- More files than a minimal CRUD implementation
- Slightly higher initial complexity
- Additional serializers to maintain

These trade-offs are acceptable because the project prioritizes production-ready engineering practices over minimal code.

---

# Related Features

- Feature 04 — Posts Domain Architecture & Database Design
- Feature 05 — Publishing Workflow (planned)
- Feature 06 — Categories (planned)
- Feature 07 — Tags (planned)