# Feature 10 — Comments

## Feature Summary

Implements the Comments domain for the Production-Grade Blog Platform using Django REST Framework.

This feature enables authenticated users to create, update, and delete comments on published blog posts while allowing public users to read comment discussions.

The implementation follows the project's established architecture patterns, including action-specific serializers, object-level permissions, audit tracking, soft deletion, and secure ownership enforcement.

---

# What's Included

* Comments Django application
* Comment model
* Post–Comment relationship
* User–Comment relationship
* Public comment listing
* Authenticated comment creation
* Comment update API
* Comment soft-delete API
* Action-specific serializers
* Object-level permission enforcement
* Published-post validation
* Audit field integration
* Soft-delete integration
* Django Admin integration
* Query optimization using `select_related`
* Manual API verification

---

# Architecture Summary

## Domain Structure

```text
User
 └── Comments

Post
 └── Comments
```

Each Comment:

* Belongs to one User
* Belongs to one Post
* Supports audit tracking
* Supports soft deletion

---

## API Architecture

### Collection Routes

```text
GET  /api/posts/{post_slug}/comments/
POST /api/posts/{post_slug}/comments/
```

### Resource Routes

```text
PATCH  /api/comments/{id}/
DELETE /api/comments/{id}/
```

Hybrid routing was selected to keep collection operations tied to Posts while allowing individual Comment operations through dedicated resource endpoints.

---

## View Architecture

### PostCommentViewSet

Responsibilities:

* List comments
* Create comments

### CommentViewSet

Responsibilities:

* Update comments
* Soft delete comments

---

## Serializer Architecture

* CommentAuthorSerializer
* CommentCreateSerializer
* CommentListSerializer
* CommentUpdateSerializer

---

# Files Created

```text
apps/comments/
├── admin.py
├── apps.py
├── models.py
├── permissions.py
├── serializers.py
├── urls.py
├── views.py
├── migrations/
│   └── 0001_initial.py
└── tests/
    └── __init__.py
```

---

# Files Modified

```text
config/settings/base.py
config/urls.py
```

---

# Database Changes

## New Table

```text
comments_comment
```

### Fields

```text
id
post_id
author_id
content
created_at
updated_at
created_by_id
updated_by_id
is_deleted
deleted_at
deleted_by_id
```

---

## Relationships

### Comment → Post

```python
ForeignKey(
    Post,
    on_delete=CASCADE,
)
```

### Comment → User

```python
ForeignKey(
    User,
    on_delete=PROTECT,
)
```

---

# APIs Implemented

## List Comments

```http
GET /api/posts/{post_slug}/comments/
```

Access:

```text
Public
```

---

## Create Comment

```http
POST /api/posts/{post_slug}/comments/
```

Access:

```text
Authenticated Users
```

---

## Update Comment

```http
PATCH /api/comments/{id}/
```

Access:

```text
Comment Author Only
```

---

## Delete Comment

```http
DELETE /api/comments/{id}/
```

Access:

```text
Comment Author Only
```

Behavior:

```text
Soft Delete
```

---

# Permissions

## IsCommentAuthor

Enforces:

```python
obj.author_id == request.user.id
```

Used for:

* Update
* Delete

---

# Security

## Authentication

Required for:

* Create
* Update
* Delete

---

## Authorization

Object-level ownership validation through:

```text
IsCommentAuthor
```

---

## Mass Assignment Protection

Clients cannot control:

```text
author
post
created_by
updated_by
deleted_by
is_deleted
```

---

## IDOR Protection

Ownership is validated on every update and delete request.

---

## Information Leakage Prevention

Comments may only be created against published, visible posts.

Draft, unpublished, deleted, or invalid posts return:

```http
404 Not Found
```

---

## XSS Consideration

Comment content is stored as plain text.

Frontend rendering must avoid:

```jsx
dangerouslySetInnerHTML
```

unless explicit sanitization is introduced in a future feature.

---

# Query Optimization

Implemented:

```python
select_related("author")
```

and

```python
select_related("author", "post")
```

where appropriate.

Benefits:

* Prevents N+1 queries
* Reduces database load
* Improves scalability

---

# Manual Testing Coverage

Verified:

* Public comment listing
* Authenticated comment creation
* Anonymous create rejection
* Published-post validation
* Invalid-post validation
* Missing content validation
* Whitespace-only validation
* Maximum-length validation
* Author assignment protection
* Post assignment protection
* Comment update
* Comment ownership enforcement
* Comment deletion
* Soft-delete behavior
* Deleted-comment exclusion
* Response data exposure rules

---

# Key Concepts Learned

* One-to-Many relationships
* Object-level permissions
* DRF ViewSets
* Action-specific serializers
* Soft deletion
* Audit tracking
* Ownership enforcement
* Hybrid API routing
* Query optimization with `select_related`
* Mass-assignment protection
* IDOR prevention

---

# Interview Questions

### Why use `PROTECT` on the Comment author relationship?

To prevent accidental deletion of user-generated content and preserve ownership history.

---

### Why use object-level permissions?

To ensure users can only modify resources they own.

---

### What is IDOR?

Insecure Direct Object Reference occurs when a user can access or modify another user's resource by changing identifiers in requests.

---

### Why use `select_related()`?

To reduce database queries when loading related objects.

---

### Why separate author and audit fields?

Ownership and operational history represent different business concerns.

---

### Why use soft deletion?

To preserve data, support restoration, and maintain audit history.

---

# Common Mistakes

* Trusting client-supplied author values
* Allowing comment creation on unpublished posts
* Forgetting object-level permissions
* Physically deleting business entities
* Exposing email addresses in public APIs
* Creating N+1 query problems
* Coupling comment ownership to post ownership
* Mixing serializer responsibilities

---

# Refactoring Opportunities

Future enhancements may include:

* Threaded replies
* Comment moderation
* Comment reporting
* Comment restoration APIs
* Notifications
* Reactions
* Spam detection
* Throttling
* Pagination improvements

---

# Documentation Updates Required

Update:

```text
README.md
Architecture.md
Database-Design.md
API-Specification.md
Testing-Strategy.md
Project-Status.md
```

Create:

```text
docs/adr/ADR-014-Comments-Domain-Architecture.md
docs/features/Feature-10-Comments.md
```

---

# Feature Status

```text
Status: Completed
```

Feature 10 successfully introduces the Comments domain with secure ownership enforcement, audit tracking, soft deletion, and production-oriented API design while remaining fully aligned with the platform architecture.
