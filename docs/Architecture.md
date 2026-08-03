# Architecture

## Project Overview

The **Production-Grade Blog Platform** is a full-stack web application designed using an **API-First Architecture**. The frontend and backend are developed as independent applications that communicate exclusively through REST APIs.

This project emphasizes production-ready software engineering practices, including scalability, maintainability, security, testing, and clean architecture, while serving as a practical learning platform for Django, Django REST Framework, React, and PostgreSQL.

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router _(planned)_
- Axios _(planned)_

### Backend

- Django
- Django REST Framework

### Database

- PostgreSQL

### Authentication

- JWT Authentication (Simple JWT)
- Email-Based Authentication
- JWT Access Tokens
- JWT Refresh Tokens
- Refresh Token Blacklisting

### Deployment _(Planned)_

- Docker
- Gunicorn
- Nginx
- Linux Server

---     

# Architecture Style

The project follows an **API-First, Client-Server Architecture**.

The frontend never communicates directly with the database. Every request passes through the backend API, where authentication, authorization, validation, and business logic are enforced before any database interaction occurs.

```text
┌────────────────────┐
│ React Frontend     │
└─────────┬──────────┘
          │ HTTP / JSON
          ▼
┌────────────────────┐
│ Django REST API    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Business Logic     │
│ (Services / Views) │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Django ORM         │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ PostgreSQL         │
└────────────────────┘
```

---

# Architectural Principles

The project follows these engineering principles:

- API-First Development
- Separation of Concerns
- Single Responsibility Principle (SRP)
- SOLID Principles
- Clean Code
- Production-Ready Folder Structure
- Backend-Enforced Security
- Incremental Feature Development

---

# Frontend Architecture

## Technology

- React
- Vite
- Tailwind CSS

## Responsibilities

- Render the user interface.
- Manage client-side state.
- Consume REST APIs.
- Handle routing.
- Manage authentication state.
- Display server responses and validation errors.

The frontend is responsible only for presentation and user interaction. It never contains business rules or permission enforcement.

---

# Backend Architecture

## Technology

- Django
- Django REST Framework

## Responsibilities

- Business logic
- Authentication
- Authorization
- Request validation
- Response serialization
- Permission enforcement
- Database interaction

The backend is the single source of truth for all application rules and security.

---

# Database Architecture

## Technology

- PostgreSQL

## Responsibilities

- Persistent data storage
- Relationship management
- Data integrity
- Constraints
- Indexes
- Transaction support

All database operations are performed through Django's ORM.

---

# Current Application Structure

```text
backend/
│
├── apps/
│   ├── core/
│   ├── users/
│   ├── posts/
│   ├── categories/
│   ├── tags/
│   ├── comments/
│   └── profiles/
│
├── config/
│
├── requirements/
│
└── manage.py
```

### apps/

Contains all business applications.

Each domain of the project (Users, Posts, Comments, Categories, etc.) is implemented as an independent Django application.

### core/

Contains shared functionality used across multiple applications.

### users/

Responsible for user management and the custom user model.

### posts/

Responsible for blog content management.

Current responsibilities include:

* Post creation
* Published post listing
* Single post retrieval
* Author-owned post updates
* Soft deletion
* Slug generation
* Draft and published post lifecycle management
* Publish and unpublish workflows
* Post–Category many-to-many relationship
* Post–Tag many-to-many relationship
* Slug-based tag assignment
* Nested tag representation in post responses
* Tag relationship validation
* Shared taxonomy validation through serializer mixins
* Slug-based category assignment
* Nested category representation in post responses
* Category relationship validation
* Query optimization using `prefetch_related()`

The application follows the same architectural principles as the rest of the project by separating responsibilities across models, serializers, permissions, viewsets, and routing.

### comments/

Responsible for user discussions attached to published Posts.

Current responsibilities include:

* Public Comment listing
* Authenticated Comment creation
* Author-owned Comment updates
* Author-owned Comment soft deletion
* Post–Comment one-to-many relationship
* User–Comment one-to-many relationship
* Published-Post validation
* Comment ownership enforcement
* Audit tracking
* Soft-delete lifecycle management
* Query optimization using `select_related()`

The Comments domain remains independent from Posts. The Posts application owns publication and Post lifecycle rules, while the Comments application owns Comment storage, validation, permissions, and API behavior.


---

# Authentication Architecture

The project adopts a **custom Django User model** from the beginning of development.

Choosing a custom user model before the first database migration prevents costly schema migrations later and provides flexibility for future authentication requirements.

## Current Status (Feature 16)

### Implemented:

- Custom User model
- AUTH_USER_MODEL configured
- Email-based authentication backend
- JWT Authentication using Simple JWT
- Administrator-controlled User Creation API
- User Login API
- User Logout API
- Current User API
- Refresh Token API
- Token Verification API
- Refresh Token Blacklisting

### Planned:

- Password Change
- Password Reset
- Email Verification

### Implemented Authorization Extension:

- Independent Django Group roles: Author, Editor, and Administrator
- Reusable DRF role permissions in `apps.core.permissions`
- Authorization-scoped Post querysets
- Object ownership with Editor override
- Separation of Django staff access from application roles

---

# Request Flow

Current request flow:

```text
React Frontend
        │
        ▼
HTTP Request
        │
        ▼
Django URL Router
        │
        ▼
JWT Authentication
        │
        ▼
Permissions
        │
        ▼
APIView
        │
        ▼
Serializer
        │
        ▼
Business Logic
        │
        ▼
Django ORM
        │
        ▼
PostgreSQL
```

Each request is validated before reaching the database.

---

# Response Flow

```text
PostgreSQL
   │
   ▼
Django ORM
   │
   ▼
Business Logic
   │
   ▼
Serializer
   │
   ▼
JSON Response
   │
   ▼
React Frontend
```

Responses are serialized into JSON before being returned to the client.

---

# Posts Architecture

The Posts application is implemented as an independent domain module following the project's modular architecture.

### Current Design

- Dedicated `Post` model
- Slug-based resource lookup
- Separate serializers for create, list, retrieve, and update operations
- DRF `GenericViewSet` with action-specific mixins
- Object-level authorization using a custom permission class
- Soft deletion through an abstract base model
- Audit fields for creation, updates, and deletion
- Dedicated workflow serializers for publishing actions
- Custom ViewSet actions for publish and unpublish operations
- Backend-enforced status transition validation
- Automatic publication timestamp management
- Many-to-many relationship between Posts and Categories
- Many-to-many relationship between Posts and Tags
- Slug-based category assignment through `category_slugs`
- Lightweight nested category serializer for post responses
- Lightweight nested tag serializer for post responses
- Backend validation for duplicate, inactive, and invalid categories
- Backend validation for duplicate, inactive, and invalid tags
- Shared taxonomy validation through reusable serializer mixins
- Query optimization using `prefetch_related("categories", "tags")`

### Publishing Workflow

Publishing is modeled as a domain workflow rather than a standard CRUD operation.

Instead of exposing the `status` field through the update endpoint, the Posts module provides two dedicated actions:

* `POST /api/posts/{slug}/publish/`
* `POST /api/posts/{slug}/unpublish/`

Workflow-specific serializers encapsulate the business rules for valid state transitions:

* Draft → Published
* Published → Draft

This approach centralizes workflow validation, prevents invalid state changes, and keeps business logic separate from content editing.

The backend automatically manages the `published_at` timestamp to ensure consistency between publication status and publication date.

### Post–Category Relationship

Feature 08 introduces a many-to-many relationship between Posts and Categories.

```text
Post
   ↔
Many-to-Many
   ↔
Category
```
### Request Processing

Post creation and update requests involving categories follow this flow:

```text
React Frontend
        │
        ▼
HTTP Request
        │
        ▼
Django URL Router
        │
        ▼
JWT Authentication
        │
        ▼
Permissions
        │
        ▼
PostViewSet
        │
        ▼
PostCreateSerializer /
PostUpdateSerializer
        │
        ▼
Validate post fields
        │
        ▼
Validate category slugs
        │
        ▼
Resolve active Category objects
        │
        ▼
Create or update Post
        │
        ▼
Synchronize many-to-many relationships
        │
        ▼
Django ORM
        │
        ▼
PostgreSQL
```

This separation of concerns keeps validation, authorization, business logic, and persistence independent and maintainable.

---

### Post–Tag Relationship

Feature 09 introduces a many-to-many relationship between Posts and Tags.

```text
Post
   ↔
Many-to-Many
   ↔
Tag
```

Tags provide flexible classification and content discovery.

Posts reference tags using the `tag_slugs` write field and return lightweight nested tag representations through the read API.

The relationship architecture intentionally mirrors the Post–Category implementation to maintain consistency across taxonomy domains.

### Request Processing

Post creation and update requests involving tags follow this flow:

```text
React Frontend
        │
        ▼
HTTP Request
        │
        ▼
Django URL Router
        │
        ▼
JWT Authentication
        │
        ▼
Permissions
        │
        ▼
PostViewSet
        │
        ▼
PostCreateSerializer /
PostUpdateSerializer
        │
        ▼
Validate post fields
        │
        ▼
Validate tag slugs
        │
        ▼
Resolve active Tag objects
        │
        ▼
Create or update Post
        │
        ▼
Synchronize many-to-many relationships
        │
        ▼
Django ORM
        │
        ▼
PostgreSQL
```
---

# Categories Architecture

The Categories application is implemented as an independent domain module that provides reusable taxonomy for organizing blog content.

### Current Design

- Dedicated `Category` model
- Slug-based resource lookup
- Separate serializers for create, read, and update operations
- DRF `GenericViewSet` with explicit mixins
- Action-based serializer selection
- Action-based permission selection
- Editor-managed category administration
- Active status management through a custom manager
- Audit fields for creation and updates
- Automatic slug generation
- Many-to-many association with Posts
- Slug-based assignment through the Posts API
- Reverse post access using `category.posts`
- Existing relationships preserved when categories become inactive

### Request Processing

Each Categories API request follows the standard application request flow:

```text
React Frontend
        │
        ▼
HTTP Request
        │
        ▼
Django URL Router
        │
        ▼
JWT Authentication
        │
        ▼
Permissions
        │
        ▼
CategoryViewSet
        │
        ▼
Serializer
        │
        ▼
Django ORM
        │
        ▼
PostgreSQL
```

### Relationship with Posts

Categories remain independently managed through the Categories API.

The Posts API references existing categories but does not create or modify Category records.

```text
Post API
   │
   ▼
Validate category slugs
   │
   ▼
Retrieve active Category objects
   │
   ▼
Create or update relationship rows
```

# Tags Architecture

The Tags application is implemented as an independent taxonomy domain that provides reusable labels for classifying blog content.

### Current Design

- Dedicated `Tag` model
- Slug-based resource lookup
- Separate serializers for create, read, and update operations
- DRF `GenericViewSet` with explicit mixins
- Action-based serializer selection
- Action-based permission selection
- Editor-managed tag administration
- Active status management through a custom manager
- Audit fields for creation and updates
- Automatic slug generation
- Many-to-many association with Posts
- Slug-based assignment through the Posts API
- Reverse post access using `tag.posts`
- Existing relationships preserved when tags become inactive

### Request Processing

Each Tags API request follows the standard application request flow:

```text
React Frontend
        │
        ▼
HTTP Request
        │
        ▼
Django URL Router
        │
        ▼
JWT Authentication
        │
        ▼
Permissions
        │
        ▼
TagViewSet
        │
        ▼
Serializer
        │
        ▼
Django ORM
        │
        ▼
PostgreSQL
```
### Relationship with Posts

Tags remain independently managed through the Tags API.

The Posts API references existing tags but does not create or modify Tag records.

```text
Post API
   │
   ▼
Validate tag slugs
   │
   ▼
Retrieve active Tag objects
   │
   ▼
Create or update relationship rows
```
---

# Comments Architecture

The Comments application is implemented as an independent business domain for discussions attached to published Posts.

Comments are classified as business entities and therefore use audit tracking and soft deletion.

## Current Design

* Dedicated `Comment` model
* Required ForeignKey relationship to Post
* Required ForeignKey relationship to User through `author`
* `CASCADE` behavior for physical Post deletion
* `CASCADE` behavior for physical User deletion
* Shared timestamp, audit, and soft-delete abstract models
* Flat Comment structure without threaded replies
* Action-specific serializers
* Object-level ownership permission through `IsCommentAuthor`
* `GenericViewSet` with explicit DRF mixins
* Hybrid nested and top-level API routing
* Backend-controlled Post and author assignment
* Published-Post validation
* Query optimization through `select_related()`

## Domain Relationships

```text
Post
 └── Comments
     One-to-Many
```

```text
User
 └── Comments
     One-to-Many
```

Each Comment belongs to exactly one Post and one author.

The Comment author owns the Comment. Post ownership does not grant permission to modify another user's Comment.

## API Routing

Comment collections are scoped to a Post:

```text
GET  /api/posts/{post_slug}/comments/
POST /api/posts/{post_slug}/comments/
```

Individual Comment operations use top-level resource routes:

```text
PATCH  /api/comments/{id}/
DELETE /api/comments/{id}/
```

This hybrid routing design keeps Comment creation and listing connected to the parent Post while avoiding unnecessary nesting for individual-resource operations.

## View Architecture

### `PostCommentViewSet`

Responsibilities:

* List Comments for a published Post
* Create Comments on a published Post
* Resolve the Post from `post_slug`
* Assign the authenticated User as author
* Populate creation audit fields

### `CommentViewSet`

Responsibilities:

* Partially update a Comment
* Soft delete a Comment
* Enforce authentication
* Enforce object-level ownership
* Populate update and deletion audit fields

## Serializer Architecture

The Comments domain uses action-specific serializers:

* `CommentAuthorSerializer`
* `CommentCreateSerializer`
* `CommentListSerializer`
* `CommentUpdateSerializer`

Create and update serializers expose only the `content` field.

The backend controls:

* `post`
* `author`
* `created_by`
* `updated_by`
* Soft-delete fields

The list representation returns safe public author information without exposing email addresses or audit fields.

## Comment Creation Flow

```text
React Frontend
        │
        ▼
POST /api/posts/{post_slug}/comments/
        │
        ▼
JWT Authentication
        │
        ▼
Resolve published, non-deleted Post
        │
        ▼
CommentCreateSerializer
        │
        ▼
Validate Comment content
        │
        ▼
Assign Post and request.user
        │
        ▼
Populate audit fields
        │
        ▼
Create Comment
        │
        ▼
PostgreSQL
        │
        ▼
CommentListSerializer
        │
        ▼
201 Created
```

## Comment Listing Flow

```text
React Frontend
        │
        ▼
GET /api/posts/{post_slug}/comments/
        │
        ▼
Resolve published, non-deleted Post
        │
        ▼
Load non-deleted Comments
        │
        ▼
select_related("author")
        │
        ▼
CommentListSerializer
        │
        ▼
200 OK
```

## Comment Update and Delete Flow

```text
Authenticated User
        │
        ▼
PATCH or DELETE /api/comments/{id}/
        │
        ▼
JWT Authentication
        │
        ▼
Resolve non-deleted Comment
        │
        ▼
IsCommentAuthor
        │
        ├── Non-owner → 403 Forbidden
        │
        ▼
Update content or perform soft deletion
        │
        ▼
Update audit fields
        │
        ▼
Database
```

## Lifecycle Behavior

A Comment follows this lifecycle:

```text
Created
   │
   ├── Updated
   │
   ▼
Soft Deleted
```

Soft-deleted Comments remain in the database but are excluded from normal API queries.

Threaded replies, restoration endpoints, reporting, and Editor moderation are intentionally deferred to future features.

---

# Profiles Architecture

The Profiles application is implemented as an independent business domain responsible for user profile information while keeping authentication concerns inside the Users domain.

## Current Design

* Dedicated `Profile` model
* One-to-One relationship with User
* Automatic Profile creation through Django signals
* Existing User Profile backfill migration
* Action-specific serializers
* Private Profile API
* Public Profile API
* Profile ownership enforcement through authenticated User context
* Public/private Profile representations
* Query optimization through `select_related("user")`

## Domain Relationship

```text
User (1)
   │
   ▼
Profile (1)
```

Each User owns exactly one Profile.

Each Profile belongs to exactly one User.

## Separation of Responsibilities

### Users Domain

Responsible for:

* Authentication
* Authorization
* JWT Management
* User Identity
* Login and Administrator-controlled account provisioning

### Profiles Domain

Responsible for:

* Biography
* Website
* Location
* Date of Birth
* Public Profile Information
* Profile APIs

This separation prevents authentication concerns from becoming coupled with profile-management concerns.

## API Architecture

### Current User Profile

```text
GET   /api/profile/
PATCH /api/profile/
```

Responsibilities:

* Retrieve authenticated User Profile
* Update authenticated User Profile
* Enforce ownership through `request.user`

### Public Profile

```text
GET /api/users/{username}/profile/
```

Responsibilities:

* Expose safe public Profile information
* Hide private Profile fields
* Support public author discovery

## Serializer Architecture

The Profiles domain uses action-specific serializers:

* `ProfileSerializer`
* `ProfileUpdateSerializer`
* `PublicProfileSerializer`

This separation prevents accidental exposure of private data and keeps validation responsibilities isolated.

## Automatic Profile Creation Flow

```text
User Created
      │
      ▼
post_save Signal
      │
      ▼
Profile Created
```

The signal guarantees that every newly created User receives a corresponding Profile.

## Existing User Backfill

A dedicated data migration creates Profiles for Users that existed before Feature 11.

This guarantees:

```text
Every User has exactly one Profile
```

## Profile Request Flow

```text
React Frontend
        │
        ▼
HTTP Request
        │
        ▼
JWT Authentication
        │
        ▼
request.user
        │
        ▼
Profile Lookup
        │
        ▼
Serializer
        │
        ▼
PostgreSQL
```

## Public Profile Flow

```text
React Frontend
        │
        ▼
Username
        │
        ▼
Profile Lookup
        │
        ▼
PublicProfileSerializer
        │
        ▼
JSON Response
```

---

# Search Architecture

Feature 12 adds a public Post search endpoint without creating a separate search domain or table.

- `PostSearchAPIView` validates `q` through `PostSearchQuerySerializer`.
- `PostQuerySet.search()` centralizes PostgreSQL full-text search.
- Title, excerpt, and content use weights A, B, and C.
- PostgreSQL `websearch` parsing and the `english` configuration are used.
- A functional GIN index matches the weighted search vector.
- Only published, non-deleted Posts are searchable.
- Results are relevance-ranked and page-number paginated.
- Author, Category, and Tag relationships are eagerly loaded.

---

# Featured Image Architecture

Feature 13 extends the Post domain with one optional `ImageField` rather than introducing a separate media domain.

- `PUT` and `DELETE` share the `/api/posts/{slug}/featured-image/` action.
- Multipart parsing is isolated to the featured-image action.
- Serializer and model validation share a Pillow-backed validation pipeline.
- The upload path uses UUID filenames under date-based directories.
- A dedicated service layer handles replacement and removal.
- Old storage objects are deleted only after database commit.
- Public serializers expose an absolute `featured_image_url`, not a storage path.
- Soft deletion preserves the image because a soft-deleted Post may be restored.

---

# Authorization Architecture

Feature 14 centralizes cross-domain role checks in `apps.core.permissions` and keeps resource ownership rules close to their domains.

The application roles are independent Django Groups:

- `Author` — creates Posts and manages owned Posts.
- `Editor` — creates Posts, manages any active Post, and manages Categories and Tags.
- `Administrator` — reserved for user and role administration; it does not automatically receive editorial access.

The effective Post-management policy is:

```text
Authenticated
AND (Author OR Editor)
AND (owned Post OR Editor override)
AND authorization-scoped queryset
```

Public Post actions use published querysets. For management actions, Editors receive all active Posts while Authors receive only owned Posts. Queryset scoping limits object enumeration; object permissions remain as defense in depth.

`IsEditorOrReadOnly` provides public taxonomy reads and Editor-only writes. Django `is_staff` continues to control Django Admin access and does not grant application API privileges. Group records are provisioned by a historical-safe data migration, while runtime code uses centralized role-name constants.

---

# User Administration Architecture

Feature 15 changes the platform to a closed-registration editorial CMS. Public registration is removed, and account provisioning is handled by `UserAdministrationViewSet` under `/api/admin/users/`.

```text
JWT authentication
    → IsAdministrator
    → action-specific serializer
    → UserAdministrationService
    → atomic User and Group updates
```

The ViewSet combines only create, list, and retrieve mixins. Activation, deactivation, and complete application-role replacement are explicit actions; generic user update and deletion routes are not exposed. Responses omit password hashes, staff and superuser flags, direct permissions, and unrelated Groups.

`UserAdministrationService` owns lifecycle invariants and transaction boundaries. Operations that can reduce Administrator access lock the Administrator Group and target User rows so concurrent requests cannot both remove the final active Administrator. The service also prevents self-deactivation and self-removal of the Administrator role.

Role replacement manages only `Author`, `Editor`, and `Administrator`, preserving unrelated Django Group memberships. The administration queryset prefetches Groups, uses deterministic newest-first ordering, and paginates lists with a default of 20 and maximum of 100 users.

---

# Security Architecture

The backend is responsible for enforcing all security rules.

## Current security principles include:

- Never trust client input.
- Enforce permissions on the backend.
- Validate all incoming data.
- Use Django ORM to prevent SQL injection.
- Store passwords using Django's secure password hashing.
- Authenticate protected endpoints using JWT.
- Blacklist refresh tokens during logout.
- Enforce object-level permissions for resource ownership.
- Restrict Post creation to Authors and Editors.
- Restrict Post management to the owning Author or an Editor.
- Scope Post management querysets before object lookup.
- Validate publishing state transitions on the backend.
- Automatically manage publication timestamps on the backend.
- Use soft deletion to preserve audit history and prevent accidental data loss.
- Restrict category creation and updates to Editors.
- Allow public read access to active categories.
- Generate category slugs automatically on the backend.
- Prevent duplicate category names through backend validation.
- Restrict tag creation and updates to Editors.
- Allow public read access to active tags.
- Generate tag slugs automatically on the backend.
- Prevent duplicate tag names through backend validation.
- Validate all category slugs supplied through the Posts API.
- Validate all tag slugs supplied through the Posts API.
- Reject duplicate category assignments.
- Reject duplicate tag assignments.
- Reject non-existent categories.
- Reject non-existent tags.
- Reject inactive categories during new relationship assignment.
- Reject inactive tags during new relationship assignment.
- Preserve existing post-category relationships when categories become inactive.
- Preserve existing post-tag relationships when tags become inactive.
- Enforce post ownership before allowing category relationship updates.
- Never allow the Posts API to create or modify Category records implicitly.
- Never allow the Posts API to create or modify Tag records implicitly.
- Require authentication for Comment creation, updates, and deletion.
- Allow public Comment listing only through published, non-deleted Posts.
- Enforce Comment ownership through `IsCommentAuthor`.
- Prevent Post authors from modifying Comments owned by other users.
- Assign Comment authors from `request.user`.
- Assign the parent Post from the URL instead of request data.
- Prevent Comment author and Post reassignment.
- Return `404 Not Found` for invalid, draft, unpublished, or soft-deleted parent Posts.
- Exclude soft-deleted Comments from normal API querysets.
- Expose only safe public author fields in Comment responses.
- Avoid exposing User email addresses and Comment audit fields.
- Treat Comment content as untrusted plain text.
- Avoid rendering Comment content with `dangerouslySetInnerHTML` unless sanitization is introduced.
- Automatically create Profiles for users provisioned by an Administrator.
- Ensure every User owns exactly one Profile.
- Enforce Profile ownership through authenticated User context.
- Prevent Profile ownership reassignment.
- Prevent Profile updates using User IDs or Profile IDs.
- Expose email addresses only through authenticated private Profile APIs.
- Exclude email and date of birth from public Profile APIs.
- Validate website URLs before persistence.
- Prevent future dates of birth.
- Load related User data efficiently through `select_related("user")`.
- Keep Author, Editor, and Administrator roles independent and least-privileged.
- Keep Django staff/superuser flags separate from application roles.
- Validate featured-image content, size, dimensions, animation state, extension, and MIME type.
- Delete replaced media only after a successful database commit.


---

# Scalability Considerations

The architecture is designed to support future growth without major refactoring.

Planned scalability features include:

- Independent Django applications
- JWT Authentication (Implemented)
- Pagination
- Search and filtering
- Caching
- Object-level permissions
- Independent taxonomy modules with reusable architecture (Categories, Tags)
- Reusable slug-based routing across domain modules
- Docker deployment
- Reverse proxy with Nginx
- Horizontal scaling
- Many-to-many taxonomy relationships using normalized intermediate tables
- Query optimization for post-category and post-tag retrieval using `prefetch_related()`
- Lightweight nested serializers to control response size
- Future category filtering and archive endpoints
- Shared taxonomy validation logic through serializer mixins
- Independent Comments business domain
- Query optimization for Comment authors and Posts using `select_related()`
- Separate Comment collection endpoint to avoid embedding unbounded Comments in Post responses
- Standard Comment pagination through shared endpoint-level infrastructure
- Future Comment throttling and spam protection
- Flat Comment architecture that can be extended later through a dedicated threaded-replies feature
- Independent Profiles business domain
- One-to-One User–Profile architecture
- Automatic Profile provisioning through signals
- Public/private Profile serialization strategy
- Query optimization for Profile retrieval using `select_related()`
- Future avatar support without User model modifications
- Future social-link support without authentication-layer changes

---

The Profiles application introduces the platform's first dedicated User-extension domain through a one-to-one relationship.

This architecture demonstrates:

* One-to-One domain modeling
* Signal-based automation
* Data migrations for existing records
* Public/private API separation
* Ownership enforcement through authenticated context
* Secure Profile exposure patterns

The Profiles domain serves as the reference implementation for future User-adjacent domains that extend account functionality without modifying authentication architecture.

---

# Current Project Status

## Completed

- ✅ Feature 01 — Project Foundation & Architecture
- ✅ Feature 02 — Custom User Model & User App Architecture
- ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs
- ✅ Feature 04 — Posts Domain Architecture & Database Design
- ✅ Feature 05 — Publishing Workflow
- ✅ Feature 06 — Categories
- ✅ Feature 07 — Tags
- ✅ Feature 08 — Post–Category Relationship
- ✅ Feature 09 — Post–Tag Relationship
- ✅ Feature 10 — Comments
- ✅ Feature 11 — User Profiles
- ✅ Feature 12 — Search
- ✅ Feature 13 — Media Uploads
- ✅ Feature 14 — Permissions & Authorization
- ✅ Feature 15 — User Administration & Role Management
- ✅ Feature 16 — Performance Optimization

## In Progress

- None

## Next Feature

- Feature 17 — Deployment & CI/CD

---

# Future Architecture Evolution

Future applications will reuse:

* The authentication infrastructure introduced in Feature 03
* The modular business-domain architecture established in Feature 04
* The reusable taxonomy architecture established through Features 06–09
* The ownership and soft-delete architecture extended through Feature 10
* The PostgreSQL search architecture introduced in Feature 12
* The storage-safe featured-image architecture introduced in Feature 13
* The role-based authorization architecture introduced in Feature 14

The Posts, Categories, Tags, and Comments applications now demonstrate cross-domain integration without merging domain responsibilities.

These modules serve as reference implementations for future domains by demonstrating:

* `GenericViewSet` with explicit mixins
* Action-specific serializers
* Action-based permissions
* Slug-based parent-resource routing
* Primary-key-based child-resource routing
* Audit field management
* Soft-delete lifecycle management
* Active-status lifecycle management
* Backend-enforced validation
* Object-level ownership checks
* Separate read and write representations
* Nested lightweight serializers
* `select_related()` and `prefetch_related()` query optimization
* Shared serializer mixins
* Secure parent-child domain relationships

As development progresses, the architecture will expand with:

* User administration and safe role management
* Shared endpoint-level pagination and stable collection ordering
* Deployment and CI/CD

Each application will remain independently responsible for its own models, serializers, permissions, views, and routes while integrating through explicit database relationships and REST APIs.

---

# Feature 16 Performance Architecture

Feature 16 introduces `StandardPageNumberPagination` with a default page size of 20, a client `page_size` parameter, and a maximum of 100. Post, Post Comment, Category, and Tag collection ViewSets adopt it explicitly; no global DRF pagination policy was added.

Post search retains specialized `10/50` pagination. Administrator User listing retains specialized `20/100` pagination.

```text
Client request
        ↓
Authentication and permissions
        ↓
Visibility-scoped and deterministically ordered QuerySet
        ↓
Pagination count
        ↓
Bounded page retrieval and eager loading
        ↓
Serializer
        ↓
Paginated response envelope
```

Pagination operates after security and visibility rules. It does not bypass roles, ownership, published-only visibility, soft deletion, active-status filtering, or Comment parent-Post scoping.

Stable ordering is:

```text
Posts:               -published_at, -created_at, -pk
Search:              -search_rank, -published_at, -created_at, -pk
Comments:            created_at, id
Categories:          unique name
Tags:                unique name
Administrator Users: -date_joined, -pk
```

Measurements showed eager loading already prevented N+1 growth. Pagination addressed unbounded serialization, rendering, payload, memory, and client-processing costs. PostgreSQL plans confirmed `post_search_vector_gin` for selective and missing searches; broad searches may correctly use a sequential scan.

No speculative cache, stored search vector, or new database index was introduced.
