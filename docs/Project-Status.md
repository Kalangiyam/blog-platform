# Project Status

**Project Name:** Production-Grade Blog Platform

**Last Updated:** 2026-07-17

**Current Milestone:** ✅ Feature 11 — User Profiles

---

# Project Overview

The Production-Grade Blog Platform is an API-first web application built with **Django REST Framework** and **React**.

The project is designed to follow real-world software engineering practices, emphasizing:

- Clean Architecture
- SOLID Principles
- Security
- Scalability
- Maintainability
- Testing
- Documentation
- Production-ready Development Workflow

---

# Technology Stack

## Backend

- Python
- Django
- Django REST Framework (DRF)
- PostgreSQL
- Simple JWT

## Frontend

- React
- Vite
- Tailwind CSS

---

# Architecture Principles

The project follows these architectural principles:

- API-First Architecture
- Modular Django Applications
- Separation of Concerns
- Environment-Based Configuration
- Authentication Before Business Features
- Documentation-Driven Development
- Incremental Feature Delivery
- Production-Ready Engineering Practices

---

# Current Project Structure

```text
blog-platform/

├── backend/
│   ├── apps/
│   │   ├── core/
│   │   ├── users/
│   │   |    ├── authentication.py
│   │   |    ├── admin.py
│   │   |    ├── models.py
│   │   |    ├── serializers.py
│   │   |    ├── urls.py
│   │   |    ├── views.py
│   │   |    └── ...
│   │   ├── posts/
│   │   |   ├── models.py
│   │   |   ├── serializers/
│   │   |   |   ├── mixins.py
│   │   |   |   └── ...
│   │   |   ├── permissions.py
│   │   |   ├── urls.py
│   │   |   ├── views.py
│   │   |   ├── choices.py
│   │   |   ├── admin/
│   │   |   └── ...
│   │   ├── categories/
│   │   |    ├── permissions.py
│   │   |    ├── admin.py
│   │   |    ├── models.py
│   │   |    ├── serializers.py
│   │   |    ├── urls.py
│   │   |    ├── views.py
│   │   |    └── ...
│   │   ├── tags/
│   │   |    ├── permissions.py
│   │   |    ├── admin.py
│   │   |    ├── models.py
│   │   |    ├── serializers.py
│   │   |    ├── urls.py
│   │   |    ├── views.py
│   │   |    └── ...
│   │   ├── comments/
│   │   |    ├── admin.py
│   │   |    ├── apps.py
│   │   |    ├── models.py
│   │   |    ├── permissions.py
│   │   |    ├── serializers.py
│   │   |    ├── urls.py
│   │   |    ├── views.py
│   │   |    ├── migrations/
│   │   |    └── tests/
|   |   |
│   │   ├── profiles/
│   │   |    ├── admin.py
│   │   |    ├── apps.py
│   │   |    ├── models.py
│   │   |    ├── serializers.py
│   │   |    ├── signals.py
│   │   |    ├── urls.py
│   │   |    ├── views.py
│   │   |    ├── migrations/
│   │   |    └── tests/
|   |   
│   │
│   ├── config/
│   │   └── settings/
│   │       ├── base.py
│   │       ├── development.py
│   │       └── production.py
│   │
│   └── manage.py
│
├── frontend/
│
docs/
├── ADR/
│   ├── ADR-001-Project-Structure.md
│   ├── ADR-002-Settings-Architecture.md
│   ├── ADR-003-PostgreSQL.md
│   ├── ADR-004-Apps-Directory.md
│   ├── ADR-005-Core-App.md
│   ├── ADR-006-Custom-User-Model.md
│   └── ADR-007-JWT-Authentication.md
│   └── ...
│
├── feature/
│   ├── Feature 00 — Project Dashboard.md
│   ├── Feature 01 — Project Foundation & Architecture.md
│   ├── Feature 02 — Custom User Model & User App Architecture.md
│   └── Feature-03-JWT-Authentication-Foundation.md
│   └── ...
│
├── API-Specification.md
├── Architecture.md
├── Authentication-Flow.md
├── Database-Design.md
├── Project-Status.md
├── Testing-Strategy.md
│
└── README.md
```

---

# Completed Features

## ✅ Feature 00 — Project Dashboard

### Objective

Define the project roadmap and long-term development strategy.

### Completed

- Project vision
- Development roadmap
- Feature planning
- Documentation strategy

**Status:** Completed

---

## ✅ Feature 01 — Project Foundation & Architecture

### Objective

Establish the project's architecture and development foundation.

### Completed

- Django project initialization
- Modular application structure
- Core application architecture
- Environment-based settings
- Requirements management
- Documentation foundation
- Project architecture

**Status:** Completed

---

## ✅ Feature 02 — Custom User Model & User App Architecture

### Objective

Create a scalable authentication foundation.

### Completed

- Users application
- Custom User model
- AbstractUser implementation
- Email field
- AUTH_USER_MODEL configuration
- Django Admin integration
- Initial migrations
- Superuser verification

**Status:** Completed

---

## ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs

### Objective

Implement secure JWT authentication for all future protected APIs.

### Completed

#### Authentication

- Email Authentication Backend
- JWT Authentication
- Simple JWT Integration
- Refresh Token Blacklisting

#### APIs

- User Registration API
- User Login API
- Current User API
- User Logout API
- Token Refresh API
- Token Verify API

#### Security

- Password validation
- Email uniqueness validation
- JWT-protected endpoints
- Refresh token invalidation
- Backend authentication enforcement

#### Manual Testing

Successfully verified:

- User registration
- Duplicate username validation
- Duplicate email validation
- Password confirmation validation
- Successful login
- Invalid login credentials
- JWT token generation
- Protected endpoint access
- Unauthorized access
- Logout
- Refresh token
- Token verification

**Status:** Completed

## ✅ Feature 04 — Posts Domain Architecture & Database Design

### Objective

Implement the first business domain of the application by introducing blog post management with production-ready architecture and ownership enforcement.

### Completed

#### Domain Model

- Posts application
- Post model
- Slug generation
- Draft status
- Published status foundation

#### APIs

- Create Post API
- List Published Posts API
- Retrieve Single Post API
- Update Own Post API
- Soft Delete Own Post API

#### Security

- JWT-protected write operations
- Object-level permissions
- Author ownership enforcement

#### Architecture

- Action-specific serializers
- ViewSet with DRF mixins
- Soft delete support
- Audit fields
- Slug-based routing

#### Manual Testing

Successfully verified:

- Create post
- List posts
- Retrieve post
- Update own post
- Prevent updating another user's post
- Soft delete own post
- Prevent deleting another user's post
- Slug uniqueness
- Audit fields
- Permission enforcement

**Status:** Completed

## ✅ Feature 05 — Publishing Workflow

### Objective

Complete the post lifecycle by implementing a backend-enforced publishing workflow with validated status transitions.

### Completed

#### Workflow

- Publish draft posts
- Unpublish published posts
- Backend status transition validation
- Automatic publication timestamp management

#### APIs

- Publish Post API
- Unpublish Post API

#### Security

- JWT-protected publishing endpoints
- Author-only publishing
- Author-only unpublishing
- Backend workflow validation

#### Architecture

- Dedicated workflow serializers
- Custom ViewSet actions
- Separation of CRUD operations from workflow actions

#### Manual Testing

Successfully verified:

- Publish draft post
- Prevent publishing an already published post
- Unpublish published post
- Prevent unpublishing a draft post
- Author-only publishing permissions
- Authentication requirements
- Invalid slug handling
- Publication timestamp management

**Status:** Completed

## ✅ Feature 06 — Categories

### Objective

Introduce a reusable Categories domain for organizing blog posts while establishing the application's first taxonomy module.

### Completed

#### Domain Model

- Categories application
- Category model
- Unique category names
- Automatic slug generation
- Active status management

#### APIs

- Create Category API
- List Categories API
- Retrieve Category API
- Update Category API

#### Security

- Public read access
- Staff-only category management
- Backend permission enforcement

#### Architecture

- GenericViewSet with DRF mixins
- Action-specific serializers
- Slug-based routing
- Dedicated permission class
- Audit field management

#### Manual Testing

Successfully verified:

- Create category
- List categories
- Retrieve category
- Update category
- Duplicate name validation
- Automatic slug generation
- Staff-only permissions
- Active category filtering

**Status:** Completed

## ✅ Feature 07 — Tags

### Objective

Introduce a reusable Tags domain as the platform's second taxonomy module, providing flexible labeling for blog posts while remaining independent from the Posts domain until future integration.

### Completed

#### Domain Model

- Tags application
- Tag model
- Unique tag names
- Automatic slug generation
- Active status management

#### APIs

- Create Tag API
- List Tags API
- Retrieve Tag API
- Update Tag API

#### Security

- Public read access
- Staff-only tag management
- Backend permission enforcement

#### Architecture

- GenericViewSet with DRF mixins
- Action-specific serializers
- Slug-based routing
- Dedicated permission class
- Audit field management

#### Manual Testing

Successfully verified:

- Create tag
- List tags
- Retrieve tag
- Update tag
- Duplicate name validation
- Automatic slug generation
- Staff-only permissions
- Active tag filtering

**Status:** Completed

## ✅ Feature 08 — Post–Category Relationship

### Objective

Associate blog posts with one or more reusable categories using a production-ready many-to-many relationship while maintaining modular architecture and scalable API design.

### Completed

#### Database

- Added `ManyToManyField` between Post and Category
- Automatic intermediate join table
- Reusable taxonomy relationship

#### APIs

- Create posts with categories
- Update post categories
- List posts with nested categories
- Retrieve posts with nested categories

#### Validation

- Slug-based category assignment
- Duplicate category slug validation
- Active category validation
- Invalid category validation

#### Performance

- Optimized category loading using `prefetch_related()`
- Existing `select_related("author")` optimization preserved

#### Architecture

- Lightweight nested category serializer
- Slug-based relationship assignment
- Serializer-level validation
- Separation of concerns maintained

#### Manual Testing

Successfully verified:

- Create post without categories
- Create post with one category
- Create post with multiple categories
- Update categories
- Replace categories
- Clear categories
- Update without changing categories
- Reject invalid category slugs
- Reject inactive category slugs
- List endpoint returns nested categories
- Detail endpoint returns nested categories
- Query optimization
- Existing permissions remain unchanged

**Status:** Completed

---

## ✅ Feature 09 — Post–Tag Relationship

### Objective

Associate blog posts with one or more reusable tags using the taxonomy architecture established for categories, while reducing duplicated serializer validation through a shared mixin.

### Completed

#### Database

- Added `ManyToManyField` between Post and Tag
- Created the automatic intermediate join table
- Preserved existing posts without requiring a data migration
- Added the reverse `Tag.posts` relationship

#### APIs

- Create posts with tags using `tag_slugs`
- Update assigned post tags
- Replace or clear post tags
- Preserve existing tags when `tag_slugs` is omitted
- Return nested tags in post list and detail responses

#### Validation

- Slug-based tag assignment
- Duplicate tag slug validation
- Invalid tag slug validation
- Inactive tag validation
- Shared category and tag validation through `TaxonomyAssignmentMixin`

#### Performance

- Optimized tag loading using `prefetch_related("tags")`
- Preserved `select_related("author")`
- Preserved category prefetching
- Prevented N+1 queries for post taxonomy responses

#### Architecture

- Reused the established Post–Category relationship pattern
- Added a lightweight nested tag serializer
- Added a shared serializer mixin for taxonomy slug validation
- Kept create and update persistence behavior inside their respective serializers
- Preserved action-specific serializer responsibilities
- Maintained existing authentication, ownership, and permission behavior

#### Manual Testing

Successfully verified:

- Create post without tags
- Create post with one tag
- Create post with multiple tags
- Update assigned tags
- Replace tags
- Clear tags using an empty list
- Preserve tags when `tag_slugs` is omitted
- Reject duplicate tag slugs
- Reject invalid tag slugs
- Reject inactive tag slugs
- Update categories without changing tags
- Update tags without changing categories
- List endpoint returns nested tags
- Detail endpoint returns nested tags
- Shared taxonomy mixin preserves category validation
- Query optimization includes categories and tags
- Existing permissions remain unchanged

**Status:** Completed

---

## ✅ Feature 10 — Comments

### Objective

Introduce the Comments domain as the platform’s second user-generated business entity, enabling public discussions on published Posts while enforcing authentication, ownership, audit tracking, and soft deletion.

### Completed

#### Domain Model

- Comments application
- Comment model
- Post–Comment one-to-many relationship
- User–Comment one-to-many relationship
- Comment ownership through `author`
- Audit tracking
- Soft deletion
- Chronological ordering
- 2,000-character content limit

#### APIs

- Public Comment listing
- Authenticated Comment creation
- Author-owned Comment updates
- Author-owned Comment soft deletion

#### Security

- JWT-protected create, update, and delete operations
- Object-level ownership enforcement through `IsCommentAuthor`
- Backend-controlled author assignment
- Backend-controlled parent Post assignment
- Published and non-deleted Post validation
- Invalid or hidden Posts return `404 Not Found`
- Soft-deleted Comments excluded from normal querysets
- Public responses exclude email and audit fields

#### Architecture

- Independent Comments domain
- Action-specific serializers
- Two-ViewSet architecture
- Hybrid Post-scoped and top-level routing
- Shared audit and soft-delete base models
- Query optimization using `select_related()`
- Flat Comment structure with threaded replies deferred

#### Manual Testing

Successfully verified:

- Public Comment listing
- Authenticated Comment creation
- Anonymous creation denial
- Published-Post validation
- Invalid and unpublished Post handling
- Missing content validation
- Blank and whitespace-only content validation
- Maximum-length validation
- Backend author assignment
- Backend Post assignment
- Author-owned updates
- Non-author update denial
- Author-owned soft deletion
- Non-author deletion denial
- Soft-deleted Comment exclusion
- Public response field safety
- Query optimization

**Status:** Completed

---

## ✅ Feature 11 — User Profiles

### Objective

Introduce a dedicated Profiles domain as a one-to-one extension of the custom User model while separating authentication information from user-facing profile data.

### Completed

#### Domain Model

* Profiles application
* Profile model
* User–Profile one-to-one relationship
* Optional biography, website, location, and date-of-birth fields
* Timestamp tracking through `TimeStampedModel`
* User deletion cascade behavior

#### Automatic Provisioning

* Automatic Profile creation for new Users through `post_save`
* Signal registration through `ProfilesConfig.ready()`
* Existing User Profile backfill migration
* Duplicate Profile prevention
* One Profile per User database constraint

#### APIs

* Authenticated Profile retrieval
* Authenticated Profile partial updates
* Public Profile retrieval by username

#### Security

* JWT-protected private Profile operations
* Backend-controlled Profile ownership
* IDOR-resistant current-user endpoint design
* Public/private serializer separation
* Email and date-of-birth privacy
* Protected ownership and account fields
* Website and date-of-birth validation

#### Architecture

* Independent Profiles domain
* One-to-one User-extension architecture
* Action-specific serializers
* DRF generic retrieve and update views
* Explicit profile URL routing
* Query optimization using `select_related("user")`
* Django Admin fieldsets and read-only ownership

#### Manual Testing

Successfully verified:

* Authenticated Profile retrieval
* Anonymous private Profile access denial
* Authenticated Profile updates
* Anonymous Profile update denial
* Public Profile retrieval
* Unknown username handling
* Public response privacy
* Invalid website rejection
* Future date-of-birth rejection
* Optional field clearing
* Ownership reassignment prevention
* Unsupported method rejection
* New User Profile creation
* Existing User Profile backfill
* Duplicate Profile prevention
* User deletion cascade behavior
* Query optimization

**Status:** Completed

---

# Current Backend Modules

| Module     | Status                                                             |
| ---------- | ------------------------------------------------------------------ |
| Core       | ✅ Completed                                                        |
| Users      | ✅ Completed                                                        |
| Posts      | ✅ Completed (Publishing Workflow + Category and Tag Relationships) |
| Categories | ✅ Completed                                                        |
| Tags       | ✅ Completed                                                        |
| Comments   | ✅ Completed                                                        |
| Profiles   | ✅ Completed                                                        |


---

# Current API Status

## Authentication APIs

Implemented

- POST `/api/auth/register/`
- POST `/api/auth/login/`
- GET `/api/auth/me/`
- POST `/api/auth/logout/`
- POST `/api/auth/token/refresh/`
- POST `/api/auth/token/verify/`

---

## Posts APIs

Implemented

- POST `/api/posts/`
- GET `/api/posts/`
- GET `/api/posts/{slug}/`
- PATCH `/api/posts/{slug}/`
- DELETE `/api/posts/{slug}/`
- POST `/api/posts/{slug}/publish/`
- POST `/api/posts/{slug}/unpublish/`

Taxonomy Support

- Assign categories using `category_slugs`
- Update or remove assigned categories
- Assign tags using `tag_slugs`
- Update or remove assigned tags
- Preserve taxonomy relationships when write fields are omitted
- Nested category and tag representations in list and detail responses
- Shared category and tag validation through `TaxonomyAssignmentMixin`

---

## Categories APIs

Implemented

- POST /api/categories/
- GET /api/categories/
- GET /api/categories/{slug}/
- PATCH /api/categories/{slug}/

---

## Tags APIs

Implemented

- POST /api/tags/
- GET /api/tags/
- GET /api/tags/{slug}/
- PATCH /api/tags/{slug}/

---

## Comments APIs

Implemented

* GET `/api/posts/{post_slug}/comments/`
* POST `/api/posts/{post_slug}/comments/`
* PATCH `/api/comments/{id}/`
* DELETE `/api/comments/{id}/`

Current behavior:

* Public Comment listing
* Authenticated Comment creation
* Comment author ownership enforcement
* Author-only updates
* Author-only soft deletion
* Published-Post validation
* Backend-controlled Comment relationships
* Soft-deleted Comment exclusion

---

## Profiles APIs

Implemented

* GET `/api/profile/`
* PATCH `/api/profile/`
* GET `/api/users/{username}/profile/`

Current behavior:

* Authenticated private Profile retrieval
* Authenticated Profile partial updates
* Public Profile retrieval by username
* Backend-controlled Profile ownership
* Public/private response separation
* Email and date-of-birth privacy
* Website URL validation
* Future date-of-birth rejection
* Query optimization using `select_related("user")`

---

# Database Status

## Implemented Tables

- User
- Profile
- Post
- Category
- Tag
- Comment

The platform includes two reusable taxonomy tables:

- Category
- Tag

Both provide unique names, stable slug-based identification, active status management, and audit tracking.

Feature 09 extends the Post domain with a many-to-many Tag relationship.

The platform now contains the following relationships:

```text
User
 ├── Profile (One-to-One)
 ├── Posts
 └── Comments

Profile
 └── User (One-to-One)

Post
 ├── Author (ForeignKey)
 ├── Categories (ManyToMany)
 ├── Tags (ManyToMany)
 └── Comments (One-to-Many)

Category
 └── Posts (Reverse ManyToMany)

Tag
 └── Posts (Reverse ManyToMany)

Comment
 ├── Post (ForeignKey)
 └── Author (ForeignKey)
```

Django manages both taxonomy relationships through automatic intermediate join tables.

The Post–Category and Post–Tag relationships now use the same slug-based assignment, active-record validation, nested response, and query-optimization strategy.

Comments use direct foreign-key relationships rather than an intermediate table.

Feature 10 introduces:

* Comment ownership
* Comment audit tracking
* Comment soft deletion
* Post physical deletion through `CASCADE`
* User physical deletion protection through `PROTECT`

Feature 11 introduces:

* User–Profile one-to-one relationship
* Unique Profile ownership through `Profile.user`
* Automatic Profile creation for new Users
* Existing User Profile backfill migration
* Profile timestamp tracking
* User physical deletion cascade through `CASCADE`
* Separation of Profile data from authentication data



## Planned Tables

# Authentication Status

## Implemented

- Custom User Model
- Email Authentication Backend
- JWT Authentication
- JWT Access Token
- JWT Refresh Token
- Refresh Token Blacklisting
- Current User Endpoint

## Planned

- Password Change
- Password Reset
- Email Verification
- Multi-Factor Authentication (Optional)

---

# Documentation Status

## Core Documentation

- ✅ README
- ✅ Architecture
- ✅ Database Design
- ✅ API Specification
- ✅ Authentication Flow
- ✅ Testing Strategy
- ✅ Project Status

---

## Feature Reports

Completed Feature Reports:

- ✅ Feature 00 — Project Dashboard
- ✅ Feature 01 — Project Foundation & Architecture
- ✅ Feature 02 — Custom User Model & User App Architecture
- ✅ Feature 03 — JWT Authentication Foundation
- ✅ Feature 04 — Posts Domain Architecture & Database Design
- ✅ Feature 05 — Publishing Workflow
- ✅ Feature 06 — Categories
- ✅ Feature 07 — Tags
- ✅ Feature 08 — Post–Category Relationship
- ✅ Feature 09 — Post–Tag Relationship
- ✅ Feature 10 — Comments
- ✅ Feature 11 — User Profiles

---

## Architecture Decision Records

The following Architecture Decision Records (ADRs) have been documented:

- ✅ ADR-001 — Project Structure
- ✅ ADR-002 — Settings Architecture
- ✅ ADR-003 — PostgreSQL
- ✅ ADR-004 — Apps Directory
- ✅ ADR-005 — Core App
- ✅ ADR-006 — Custom User Model
- ✅ ADR-007 — JWT Authentication
- ✅ ADR-008-Posts-Domain-Architecture
- ✅ ADR-009-Publishing-Workflow
- ✅ ADR-010 — Categories Domain Architecture
- ✅ ADR-011 — Tags Domain Architecture
- ✅ ADR-012 — Post–Category Relationship Architecture
- ✅ ADR-013 — Post–Tag Relationship Architecture pending creation
- ✅ ADR-014 — Comments Domain Architecture
- ✅ ADR-015 — User Profiles Architecture

---

# Testing Status

## Manual Testing

Completed for the Authentication, Posts, Categories, Tags, Comments, and Profiles modules.

Verified:

### Authentication

- Registration
- Login
- Logout
- Protected endpoints
- Token Refresh
- Token Verification

### Posts

- Create
- List
- Retrieve
- Update
- Soft Delete
- Publish
- Unpublish
- Publishing workflow validation
- Ownership enforcement
- Object-level permissions
- Publication timestamp management
- Post–Category relationship
- Category assignment
- Category updates
- Nested category responses
- Category validation
- Post–Tag relationship
- Tag assignment
- Tag updates
- Nested tag responses
- Tag validation
- Shared taxonomy validation mixin
- Omitted-field relationship preservation
- Empty-list relationship clearing
- Query optimization for author, categories, and tags

### Categories

- Create
- List
- Retrieve
- Update
- Duplicate validation
- Slug generation
- Staff permissions
- Active category filtering

### Tags

- Create
- List
- Retrieve
- Update
- Duplicate validation
- Slug generation
- Staff permissions
- Active tag filtering

### Comments

- Public listing
- Authenticated creation
- Anonymous creation denial
- Published-Post validation
- Invalid and hidden Post handling
- Content validation
- Ownership enforcement
- Author-only updates
- Non-author update denial
- Author-only soft deletion
- Non-author deletion denial
- Backend-controlled author assignment
- Backend-controlled Post assignment
- Soft-deleted Comment exclusion
- Public response field safety
- Query optimization

### Profiles

* Authenticated private Profile retrieval
* Anonymous private Profile access denial
* Authenticated Profile updates
* Anonymous Profile update denial
* Public Profile retrieval
* Unknown username handling
* Public/private response separation
* Email privacy enforcement
* Date-of-birth privacy enforcement
* Invalid website rejection
* Future date-of-birth rejection
* Optional Profile field clearing
* Backend-controlled Profile ownership
* Ownership reassignment prevention
* Unsupported method rejection
* Automatic Profile creation
* Existing User Profile backfill
* Duplicate Profile prevention
* User deletion cascade behavior
* Query optimization using `select_related("user")`


---

## Automated Testing

Not yet implemented.

Planned during future feature development.

---

# Pending Features

## Phase 2 — User Experience

- Feature 12 — Search
- Feature 13 — Media Uploads

## Phase 3 — Advanced Features

- Feature 14 — Permissions & Authorization
- Feature 15 — Performance Optimization
- Feature 16 — Deployment & CI/CD

---

# Current Milestone

✅ Feature 11 — User Profiles

Status: **Architecture, model implementation, migrations, signal integration, existing User backfill, admin integration, serializers, APIs, URL routing, manual testing, ADR, Feature Completion Report, and documentation completed**

Feature 11 is complete.

---

# Next Milestone

## Feature 12 — Search

The next feature will introduce content search across publicly available Posts.

Planned topics include:

* Search business requirements
* Searchable Post fields
* Public search access
* Published and non-deleted Post filtering
* Search query validation
* Search result ordering
* Search result pagination
* PostgreSQL search capabilities
* Query optimization
* Indexing strategy
* API contract design
* Security against unpublished content disclosure
* Manual and automated testing strategy
* Documentation updates

# Important Architecture Decisions

The project currently follows these key architectural decisions:

- API-First Architecture
- Modular Django Applications
- Environment-Based Settings
- PostgreSQL Database
- Custom User Model
- Email-Based Authentication
- JWT Authentication (Simple JWT)
- Backend-Enforced Permissions
- Documentation-Driven Development
- Modular Posts domain
- Action-specific serializers
- Slug-based resource routing
- Soft delete architecture
- Object-level permissions
- Audit trail through abstract base models
- Dedicated workflow serializers for publishing actions
- Custom ViewSet actions for domain workflows
- Backend-enforced publishing state transitions
- Dedicated Categories domain
- Active-status manager for taxonomy models
- Staff-managed taxonomy administration
- Reusable slug generation strategy
- Dedicated Tags domain
- Reusable taxonomy architecture
- Post–Category and Post–Tag many-to-many relationships
- Slug-based taxonomy assignment
- Nested taxonomy response serializers
- Shared taxonomy validation through `TaxonomyAssignmentMixin`
- Query optimization using `select_related()` and `prefetch_related()`
- Independent Comments domain
- Post–Comment one-to-many relationship
- User–Comment one-to-many relationship
- Explicit Comment ownership
- `CASCADE` for physical Post deletion
- `PROTECT` for physical User deletion
- Hybrid Comment routing
- `PostCommentViewSet` for list and create
- `CommentViewSet` for update and delete
- Object-level Comment permission through `IsCommentAuthor`
- Backend-controlled Comment author and Post assignment
- Published-Post validation
- Flat Comments with threaded replies deferred
- Comment query optimization using `select_related()`
* Independent Profiles domain
* User–Profile one-to-one relationship
* `TimeStampedModel` inheritance for Profiles
* `CASCADE` for Profile deletion when a User is physically deleted
* Automatic Profile provisioning through a `post_save` signal
* Signal registration through `ProfilesConfig.ready()`
* Existing User Profile backfill through a data migration
* Database-enforced one-Profile-per-User constraint
* Action-specific Profile serializers
* Private, update, and public Profile representations
* Current-user Profile endpoint without object identifiers
* IDOR prevention through authenticated User context
* Public Profile retrieval by username
* Public Profile exclusion of email and date of birth
* Profile field validation for URLs and future dates
* Profile query optimization using `select_related("user")`
* DRF generic views for Profile retrieval and updates


Detailed rationale for each decision is documented in the project's ADRs.

---

# Development Workflow

Every feature follows the same engineering workflow:

1. Business Analysis
2. Architecture Design
3. Database Design
4. API Design
5. Implementation
6. Manual Testing
7. Documentation Updates
8. Feature Completion Report
9. Architecture Decision Record (ADR) _(when applicable)_
10. Project Status Update
11. Git Commit

---

# Next Feature

**Starting Point:** Feature 12 — Search