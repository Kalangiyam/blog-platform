# Feature 07 — Tags

## Feature Summary

Feature 07 introduces the **Tags** domain, establishing the application's second reusable taxonomy module.

The Tags domain provides a centralized way to label blog content using descriptive keywords while remaining independent of the Posts domain. It lays the architectural foundation for future many-to-many relationships between Posts and Tags without introducing unnecessary coupling.

This feature follows the project's API-first architecture, Vertical Slice Development workflow, and production-ready engineering standards.

---

# Business Problem

Blog posts require a flexible and reusable labeling mechanism.

Without a dedicated Tags domain:

- Tag names could become inconsistent.
- Duplicate tags would be difficult to prevent.
- Tag management would be tightly coupled to Posts.
- Future content discovery and filtering features would become harder to implement.

Feature 07 solves these problems by introducing a standalone Tag model with backend-enforced validation, slug generation, and permission management.

---

# Architecture Summary

The Tags module follows the same architectural patterns established by the Categories domain.

### Architecture Highlights

- Dedicated Django application
- GenericViewSet with DRF Mixins
- Action-specific serializers
- Slug-based routing
- Backend permission enforcement
- Active-status filtering
- Audit field tracking
- API-first design

The Tags domain is intentionally independent of the Posts domain to allow future expansion without modifying existing business logic.

---

# Database Changes

## New Model

- Tag

## Fields

- id
- name
- slug
- description
- is_active
- created_at
- updated_at
- created_by
- updated_by

## Abstract Base Models Reused

- TimeStampedModel
- AuditModel
- ActiveStatusModel

No changes were made to the Post model in this feature.

The many-to-many relationship between Posts and Tags has been intentionally deferred to a future feature.

---

# Models

## Tag

Responsibilities:

- Store reusable tag names
- Store optional tag descriptions
- Generate unique slugs
- Support public browsing
- Support staff management
- Provide future taxonomy relationships

---

# Managers

## ActiveStatusManager

Responsibilities:

- Return only active tags by default
- Hide inactive records from public queries
- Centralize reusable queryset filtering

---

# Serializers

Implemented serializers:

- TagCreateSerializer
- TagReadSerializer
- TagUpdateSerializer

Responsibilities include:

- Validation
- Duplicate prevention
- Slug generation
- Data serialization
- Update handling

---

# Permissions

Implemented permission:

- IsTagManager

Behavior:

Public:

- List tags
- Retrieve tag

Staff:

- Create tag
- Update tag

Permission enforcement is performed entirely on the backend.

---

# ViewSet

Implemented:

TagViewSet

Responsibilities:

- List tags
- Retrieve tag
- Create tag
- Update tag
- Action-specific serializer selection
- Action-specific permission selection
- Audit field management

Architecture follows the same GenericViewSet + Mixins approach used throughout the project.

---

# API Endpoints

Implemented endpoints:

```text
POST    /api/tags/
GET     /api/tags/
GET     /api/tags/{slug}/
PATCH   /api/tags/{slug}/
```

---

# Request Flow

```text
Client
    │
    ▼
Tag API
    │
    ▼
TagViewSet
    │
    ▼
Action-specific Serializer
    │
    ▼
Tag Model
    │
    ▼
PostgreSQL
```

---

# Response Flow

```text
Database
    │
    ▼
Tag Model
    │
    ▼
Serializer
    │
    ▼
ViewSet
    │
    ▼
JSON Response
```

---

# Security

Implemented protections:

- JWT authentication for write operations
- Staff-only tag management
- Backend validation
- Duplicate tag name prevention
- Backend slug generation
- Active tag filtering
- Audit field management

The frontend is never trusted for authorization or business rule enforcement.

---

# Manual Testing

Successfully verified:

- Create tag
- List tags
- Retrieve tag
- Update tag
- Duplicate tag name validation
- Automatic slug generation
- Staff-only permissions
- Anonymous read access
- Active tag filtering
- Audit field updates

All implemented endpoints behaved as expected.

---

# Files Created

```text
apps/tags/
    admin.py
    apps.py
    models.py
    permissions.py
    urls.py
    views.py

    serializers/
        __init__.py
        tag_create.py
        tag_read.py
        tag_update.py
```

---

# Files Modified

```text
config/settings/
    base.py

config/urls.py

docs/
    README.md
    API-Specification.md
    Architecture.md
    Authentication-Flow.md
    Database-Design.md
    Testing-Strategy.md
    Project-Status.md
```

---

# Documentation Updated

Updated:

- README
- API Specification
- Architecture
- Authentication Flow
- Database Design
- Testing Strategy
- Project Status

New:

- Feature 07 Completion Report
- ADR-011 (Tags Domain Architecture)

---

# Key Engineering Concepts

This feature reinforces:

- Vertical Slice Development
- GenericViewSet architecture
- DRF Mixins
- Action-specific serializers
- Backend authorization
- Slug-based routing
- Active-status managers
- Separation of Concerns
- Reusable taxonomy design

---

# Production Considerations

Current implementation is production-ready because it provides:

- Stable URLs through slugs
- Backend validation
- Permission enforcement
- Independent domain boundaries
- Reusable architecture
- Extensible taxonomy foundation

Future features can introduce Post–Tag relationships without redesigning the Tags domain.

---

# Common Mistakes Avoided

- Using ModelViewSet unnecessarily
- Trusting frontend permissions
- Mixing business logic into views
- Coupling Tags directly to Posts
- Exposing inactive tags
- Allowing duplicate tag names
- Generating slugs on the client

---

# Interview Questions

1. Why did you implement Tags as a separate domain?

2. Why use GenericViewSet instead of ModelViewSet?

3. Why are Tags managed independently from Posts?

4. Why generate slugs on the backend?

5. Why use action-specific serializers?

6. What are the benefits of an ActiveStatusManager?

7. Why defer the many-to-many relationship between Posts and Tags?

8. How does this design support future scalability?

---

# Future Improvements

Planned enhancements include:

- Tag deletion
- Tag restoration
- Tag usage statistics
- Tag pagination
- Search and filtering
- Many-to-many relationship with Posts
- Automated test suite
- Caching for tag lists

---

# Lessons Learned

Feature 07 demonstrates the value of designing reusable business domains independently before introducing relationships between them.

By establishing Tags as a standalone taxonomy module, future features such as Post Tagging, Search, and Content Discovery can be implemented with minimal architectural changes.

This approach preserves maintainability, promotes separation of concerns, and aligns with production-grade software engineering practices.

---

# Feature Status

**Status:** ✅ Completed

Feature 07 successfully introduces the Tags domain and completes the platform's reusable taxonomy foundation. Together, the Categories and Tags domains provide a consistent, scalable architecture that prepares the application for future Post–Category and Post–Tag relationships while maintaining clean separation of concerns.