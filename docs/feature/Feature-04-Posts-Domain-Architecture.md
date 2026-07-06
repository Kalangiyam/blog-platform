# Feature 04 — Posts Domain Architecture & Database Design

## Feature Summary

Feature 04 introduces the first business domain of the Blog Platform: Posts.

This feature establishes the complete foundation for managing blog posts while following production-grade engineering practices, including modular architecture, object-level permissions, audit fields, soft deletion, and slug-based routing.

---

# Business Requirements

The Posts module enables authenticated users to:

- Create blog posts
- View published posts
- Retrieve a single published post
- Update their own posts
- Soft delete their own posts

The system ensures:

- Public users can only view published posts.
- Only authenticated users can create posts.
- Only the author can update or delete their own posts.
- Deleted posts remain in the database for auditing.

---

# Architecture Summary

The Posts domain follows the project's vertical-slice architecture.

Each responsibility is separated into dedicated components:

- Model
- Serializers
- ViewSet
- Permissions
- URLs

Action-specific serializers are used for create, list, retrieve, and update operations to keep responsibilities isolated and maintainable.

---

# Database Changes

## New Model

### Post

Key fields:

- title
- slug
- excerpt
- content
- status
- author
- published_at

Inherited fields:

- created_at
- updated_at
- created_by
- updated_by
- is_deleted
- deleted_at
- deleted_by

---

# APIs Implemented

| Method | Endpoint | Authentication |
|----------|----------|----------------|
| POST | /api/posts/ | Required |
| GET | /api/posts/ | Public |
| GET | /api/posts/{slug}/ | Public |
| PATCH | /api/posts/{slug}/ | Author Only |
| DELETE | /api/posts/{slug}/ | Author Only |

---

# Request Flow

```text
Client
    │
    ▼
Router
    │
    ▼
PostViewSet
    │
    ▼
Authentication
    │
    ▼
Permissions
    │
    ▼
Serializer
    │
    ▼
Post Model
    │
    ▼
Database
```

---

# Response Flow

```text
Database
    │
    ▼
Post Model
    │
    ▼
Serializer
    │
    ▼
JSON Response
    │
    ▼
Client
```

---

# Permissions

Implemented:

- AllowAny
  - List Posts
  - Retrieve Post

- IsAuthenticated
  - Create Post

- IsPostAuthor
  - Update Post
  - Delete Post

Object-level permissions ensure only the owner can modify their own posts.

---

# Security

Implemented security measures:

- JWT authentication
- Object-level permissions
- Backend ownership enforcement
- Automatic author assignment
- Automatic audit field management
- Slug uniqueness
- Soft deletion
- Server-side validation

The frontend is never trusted for ownership or audit information.

---

# Manual Testing

Verified successfully:

## Create

- Authenticated create
- Anonymous create denied
- Automatic author assignment
- Automatic slug generation

## List

- Public access
- Published posts only

## Retrieve

- Retrieve by slug
- Published posts only

## Update

- Author can update
- Non-author denied
- Audit fields updated

## Delete

- Soft delete
- Author only
- Deleted posts hidden from default queries

---

# Files Created

```text
apps/posts/
├── permissions.py
├── admin/
│   ├── action.py
│   └── post_admin.py
├── serializers/
│   ├── author.py
│   ├── post_create.py
│   ├── post_list.py
│   ├── post_detail.py
│   └── post_update.py
```

---

# Files Modified

```text
apps/posts/
├── models.py
├── views.py
├── urls.py
├── serializers/__init__.py
├── admin/__init__.py

apps/core/
├── models/
├── managers/
```

---

# Key Concepts Learned

- DRF ViewSets
- Mixins
- Action-specific serializers
- Object-level permissions
- Slug-based routing
- Soft delete architecture
- Audit fields
- Ownership enforcement

---

# Interview Questions

1. Why use ViewSets instead of APIViews?
2. Why create different serializers for each action?
3. Why use slug-based URLs?
4. What are object-level permissions?
5. Why use soft delete instead of hard delete?
6. How does DRF call `get_permissions()`?
7. What is the purpose of `get_queryset()`?
8. Why should the backend assign the author instead of the frontend?

---

# Common Mistakes

- Trusting client-provided author IDs.
- Using one serializer for all actions.
- Forgetting object-level permission checks.
- Hard deleting records.
- Exposing draft posts publicly.
- Allowing duplicate slugs.

---

# Refactoring Opportunities

Future improvements include:

- Service layer for business logic.
- Publish/Unpublish workflow.
- Editor and Admin roles.
- Pagination.
- Filtering.
- Search.
- Automated tests.

---

# Project State

Completed Features:

- ✅ Feature 00
- ✅ Feature 01
- ✅ Feature 02
- ✅ Feature 03
- ✅ Feature 04

Next Feature:

Feature 05 — Publishing Workflow