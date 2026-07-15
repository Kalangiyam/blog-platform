# ADR-014 — Comments Domain Architecture

## Status

* **Status:** Accepted
* **Date:** 2026-07-15
* **Feature:** Feature 10 — Comments

---

# Context

The Blog Platform currently supports:

* User Authentication
* Posts
* Publishing Workflow
* Categories
* Tags
* Post–Category Relationships
* Post–Tag Relationships

At this stage, the platform supports content creation but does not support user interaction around published content.

Feature 10 introduces the Comments domain to enable authenticated users to participate in discussions on published blog posts.

The architecture needed to satisfy the following business requirements:

* Authenticated users can create comments.
* Comments belong to a single published post.
* Comments belong to a single author.
* Comment ownership must be enforced.
* Comments must support future moderation workflows.
* Comments must support audit tracking.
* Comments must support soft deletion.
* Public users can read comments on published posts.
* The design must remain extensible for future replies, moderation, reporting, and notifications.

---

# Decision

The Comments domain follows the architectural decisions below.

---

## Separate Django Application

Comments are implemented as an independent Django application.

```text
apps/comments/
```

### Benefits

* Clear separation of concerns
* Independent testing
* Easier maintenance
* Future scalability
* Supports future moderation features without coupling to Posts

---

## Comment Ownership

Each Comment has a dedicated author.

```text
User
 └── Comments
```

Ownership is determined by:

```python
comment.author
```

The Post author does not automatically gain permission to modify comments written by other users.

### Benefits

* Clear ownership boundaries
* Consistent object-level permissions
* Supports future moderation roles

---

## Post–Comment Relationship

A Comment belongs to exactly one Post.

Relationship:

```text
Post
 └── Comments
```

Implementation:

```python
post = models.ForeignKey(
    "posts.Post",
    on_delete=models.CASCADE,
    related_name="comments",
)
```

### Benefits

* Simple relational model
* Efficient querying
* Natural parent-child relationship

---

## User–Comment Relationship

A Comment belongs to exactly one User.

Implementation:

```python
author = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.PROTECT,
    related_name="comments",
)
```

### Benefits

* Preserves discussion history
* Prevents accidental content loss
* Supports account deactivation strategies

---

## Soft Delete Architecture

Comments are implemented as business entities and follow the platform's shared soft-delete architecture.

Implementation:

```python
SoftDeleteModel
```

Deleted comments remain in the database and are excluded from normal application queries.

### Benefits

* Preserves audit history
* Supports future restoration
* Supports moderation workflows
* Prevents accidental data loss

---

## Author and Audit Separation

Comments maintain a dedicated author field in addition to audit fields.

```python
author
created_by
updated_by
deleted_by
```

### Benefits

* Clear business ownership
* Accurate audit tracking
* Supports future administrative workflows
* Supports future moderation actions

---

## Published Post Validation

Comments may only be created on published, non-deleted posts.

Validation is enforced through application logic rather than database constraints.

### Benefits

* Prevents interaction with unpublished content
* Prevents information leakage
* Preserves workflow consistency

---

## Flat Comment Architecture

Feature 10 implements flat comments only.

Example:

```text
Post
├── Comment
├── Comment
└── Comment
```

No self-referential parent relationship is introduced.

### Benefits

* Simpler implementation
* Easier testing
* Reduced query complexity
* Easier moderation

### Trade-Off

Threaded replies are deferred to a future feature.

---

## Hybrid Routing Architecture

The Comments API uses hybrid routing.

### Collection Endpoints

```text
GET  /api/posts/{post_slug}/comments/
POST /api/posts/{post_slug}/comments/
```

### Resource Endpoints

```text
PATCH  /api/comments/{id}/
DELETE /api/comments/{id}/
```

### Benefits

* Clear parent-child relationship
* Simple update and delete operations
* Avoids fully nested routing complexity

---

## Action-Specific Serializers

Separate serializers are used for:

* Create
* List
* Update

### Benefits

* Single Responsibility Principle
* Clear validation responsibilities
* Easier maintenance
* Consistency with existing project architecture

---

## ViewSet Architecture

Two dedicated ViewSets are used.

### PostCommentViewSet

Responsibilities:

* List comments
* Create comments

### CommentViewSet

Responsibilities:

* Update comments
* Delete comments

### Benefits

* Clear separation of collection and resource behavior
* Smaller ViewSets
* Easier maintenance

---

## Object-Level Permissions

Comment ownership is enforced through:

```python
IsCommentAuthor
```

Implementation:

```python
obj.author_id == request.user.id
```

### Benefits

* Prevents IDOR vulnerabilities
* Enforces ownership consistently
* Supports future permission expansion

---

## Query Optimization

Comment querysets use:

```python
select_related("author")
```

and where appropriate:

```python
select_related("author", "post")
```

### Benefits

* Prevents N+1 queries
* Improves scalability
* Reduces database load

---

# Consequences

## Positive

* Clear ownership model
* Secure comment lifecycle
* Consistent architecture
* Extensible design
* Scalable query patterns
* Supports future moderation features

## Negative

* Threaded replies are not available
* Moderation workflows are deferred
* Restoration APIs are not yet implemented

These trade-offs were intentionally accepted to keep Feature 10 focused on the core Comment lifecycle.

---

# Future Considerations

Potential future enhancements include:

* Threaded replies
* Comment moderation
* Comment reporting
* Comment restoration
* Comment reactions
* Comment notifications
* Spam protection
* Throttling

These capabilities can be added without redesigning the Feature 10 architecture.
