# Feature 06 — Categories

## Feature Summary

Feature 06 introduces the **Categories** domain, establishing the application's first reusable taxonomy module.

The Categories domain provides a centralized way to organize blog content while remaining independent of the Posts domain. It lays the architectural foundation for future many-to-many relationships between Posts and Categories without introducing unnecessary coupling.

This feature follows the project's API-first architecture, Vertical Slice Development workflow, and production-ready engineering standards.

---

# Business Problem

Blog posts require a consistent and reusable classification mechanism.

Without a dedicated Categories domain:

- Category names could become inconsistent.
- Duplicate categories would be difficult to prevent.
- Category management would be tightly coupled to Posts.
- Future taxonomy features would become harder to extend.

Feature 06 solves these problems by introducing a standalone Category model with backend-enforced validation, slug generation, and permission management.

---

# Architecture Summary

The Categories module follows the same architectural patterns established by previous features.

### Architecture Highlights

- Dedicated Django application
- GenericViewSet with DRF Mixins
- Action-specific serializers
- Slug-based routing
- Backend permission enforcement
- Active-status filtering
- Audit field tracking
- API-first design

The Categories domain is intentionally independent of the Posts domain to allow future expansion without modifying existing business logic.

---

# Database Changes

## New Model

- Category

## Fields

- id
- name
- slug
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

The many-to-many relationship between Posts and Categories has been intentionally deferred to a future feature.

---

# Models

## Category

Responsibilities:

- Store reusable category names
- Generate unique slugs
- Support public browsing
- Support staff management
- Provide future taxonomy relationships

---

# Managers

## ActiveStatusManager

Responsibilities:

- Return only active categories by default
- Hide inactive records from public queries
- Centralize reusable queryset filtering

---

# Serializers

Implemented serializers:

- CategoryCreateSerializer
- CategoryListSerializer
- CategoryDetailSerializer
- CategoryUpdateSerializer

Responsibilities include:

- Validation
- Duplicate prevention
- Slug generation
- Data serialization
- Update handling

---

# Permissions

Implemented permission:

- IsAdminOrReadOnly

Behavior:

Public:

- List categories
- Retrieve category

Staff:

- Create category
- Update category

Permission enforcement is performed entirely on the backend.

---

# ViewSet

Implemented:

CategoryViewSet

Responsibilities:

- List categories
- Retrieve category
- Create category
- Update category
- Action-specific serializer selection
- Action-specific permission selection
- Query optimization

Architecture follows the same GenericViewSet + Mixins approach used throughout the project.

---

# API Endpoints

Implemented endpoints:

```text
POST    /api/categories/
GET     /api/categories/
GET     /api/categories/{slug}/
PATCH   /api/categories/{slug}/
```

---

# Request Flow

```text
Client
    │
    ▼
Category API
    │
    ▼
CategoryViewSet
    │
    ▼
Action-specific Serializer
    │
    ▼
Category Model
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
Category Model
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
- Staff-only category management
- Backend validation
- Duplicate name prevention
- Backend slug generation
- Active category filtering
- Audit field management

The frontend is never trusted for authorization or business rule enforcement.

---

# Manual Testing

Successfully verified:

- Create category
- List categories
- Retrieve category
- Update category
- Duplicate name validation
- Automatic slug generation
- Staff-only permissions
- Anonymous read access
- Active category filtering
- Audit field updates

All implemented endpoints behaved as expected.

---

# Files Created

```text
apps/categories/
    admin.py
    apps.py
    models.py
    permissions.py
    urls.py
    views.py

    serializers/
        __init__.py
        category_create.py
        category_list.py
        category_detail.py
        category_update.py
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
- Authentication Flow
- Database Design
- Testing Strategy
- Project Status

New:

- Feature 06 Completion Report
- ADR-010 (Categories Domain Architecture)

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

Future features can introduce Post–Category relationships without redesigning the Categories domain.

---

# Common Mistakes Avoided

- Using ModelViewSet unnecessarily
- Trusting frontend permissions
- Mixing business logic into views
- Coupling Categories directly to Posts
- Exposing inactive categories
- Allowing duplicate category names
- Generating slugs on the client

---

# Interview Questions

1. Why did you implement Categories as a separate domain?

2. Why use GenericViewSet instead of ModelViewSet?

3. Why are categories managed independently from posts?

4. Why generate slugs on the backend?

5. Why use action-specific serializers?

6. What are the benefits of an ActiveStatusManager?

7. Why defer the many-to-many relationship between Posts and Categories?

8. How does this design support future scalability?

---

# Future Improvements

Planned enhancements include:

- Category deletion
- Category restoration
- Category usage statistics
- Category pagination
- Search and filtering
- Many-to-many relationship with Posts
- Automated test suite
- Caching for category lists

---

# Lessons Learned

Feature 06 demonstrates the value of designing reusable business domains independently before introducing relationships between them.

By establishing Categories as a standalone taxonomy module, future features such as Tags and Post Categorization can be implemented with minimal architectural changes.

This approach preserves maintainability, promotes separation of concerns, and aligns with production-grade software engineering practices.

---

# Feature Status

**Status:** ✅ Completed

Feature 06 successfully introduces the Categories domain and establishes the project's reusable taxonomy foundation while maintaining consistency with the existing architecture and preparing the application for future content organization features.