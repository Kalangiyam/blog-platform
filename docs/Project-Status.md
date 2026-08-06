# Project Status

**Project Name:** Production-Grade Blog Platform

**Last Updated:** 2026-08-06

**Current Milestone:** ✅ Frontend Feature 04 — Comments Module

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

- React 19
- Vite 8
- React Router 8
- Tailwind CSS 4
- Axios
- ESLint
- Vitest 4
- React Testing Library
- jsdom

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
│   │   │   └── permissions/
│   │   │       ├── base.py
│   │   │       ├── ownership.py
│   │   │       └── roles.py
│   │   ├── users/
│   │   |    ├── authentication.py
│   │   |    ├── admin.py
│   │   |    ├── constants.py
│   │   |    ├── models.py
│   │   |    ├── serializers/
│   │   |    ├── urls.py
│   │   |    ├── views/
│   │   |    ├── services/
│   │   |    └── ...
│   │   ├── posts/
│   │   │   ├── admin/
│   │   │   ├── serializers/
│   │   │   ├── models.py
│   │   │   ├── managers.py
│   │   │   ├── pagination.py
│   │   │   ├── constants.py
│   │   │   ├── urls.py
│   │   │   ├── views.py
│   │   │   ├── choices.py
│   │   │   └── ...
│   │   ├── categories/
│   │   |    ├── admin.py
│   │   |    ├── models.py
│   │   |    ├── serializers.py
│   │   |    ├── urls.py
│   │   |    ├── views.py
│   │   |    └── ...
│   │   ├── tags/
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

- User Registration API implemented initially
- Public registration later removed by Feature 15
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

- Historical public user registration before its removal in Feature 15
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

## ✅ Feature 12 — Search

### Objective

Implement a scalable, production-ready search system for published blog posts using PostgreSQL Full-Text Search while maintaining a stable public API.

### Completed

#### Search

- Dedicated Search API
- Query parameter validation
- Search-specific pagination
- Custom Post QuerySet
- Custom Post Manager

#### PostgreSQL

- SearchVector
- SearchQuery
- SearchRank
- Weighted search fields
- Web-style search queries
- Explicit search configuration
- GIN index

#### Security

- Published posts only
- Soft-deleted post exclusion
- Backend-controlled visibility
- Query validation
- Pagination

#### Manual Testing

Successfully verified:

- Title search
- Excerpt search
- Content search
- Case-insensitive search
- Phrase search
- Multi-word search
- OR search
- Excluded-term search
- Pagination
- Ranking
- Draft exclusion
- Soft-delete exclusion

**Status:** Completed

---

---

## ✅ Feature 13 — Media Uploads

### Objective

Introduce production-ready featured image support for blog posts with secure uploads, storage abstraction, transaction-safe file lifecycle management, and future cloud-storage compatibility.

### Completed

#### Domain Model

- Added optional featured image to the Post model
- UUID-based filename generation
- Date-based upload directory structure
- Storage-provider independent implementation

#### APIs

- Upload/replace featured image API
- Remove featured image API
- Featured image URL included in Post list responses
- Featured image URL included in Post detail responses
- Featured image URL included in Search responses

#### Validation

- File presence validation
- File size validation
- Extension validation
- MIME type validation
- Image format verification
- Corrupted image detection
- Dimension validation
- Pixel-count validation
- Animated image rejection

#### Security

- JWT-protected upload and delete endpoints
- Author-only image management
- Backend-controlled file assignment
- UUID filenames
- Transaction-safe storage cleanup

#### Architecture

- Dedicated featured-image service
- Action-specific serializers
- Reusable image representation mixin
- Upload-path abstraction
- Django Storage API
- Transaction-safe file lifecycle using `transaction.on_commit()`

#### Manual Testing

Successfully verified:

- JPEG upload
- PNG upload
- WebP upload
- Image replacement
- Old-file cleanup
- Image removal
- Repeated deletion
- Anonymous access denial
- Non-author access denial
- Invalid file rejection
- Oversized image rejection
- Corrupted image rejection
- Public image URL generation
- Search response image URL
- Draft Post upload
- Soft-delete image preservation

**Status:** Completed

---

## ✅ Feature 14 — Permissions & Authorization

### Objective

Introduce a centralized Role-Based Access Control (RBAC) architecture using Django Groups and reusable Django REST Framework permission classes while enforcing least-privilege access throughout the application.

### Completed

#### Authorization

- Django Groups
- Author role
- Editor role
- Administrator role
- Independent application roles
- Role constants
- Shared permission package

#### Permissions

- IsAuthor
- IsEditor
- IsAdministrator
- IsEditorOrReadOnly
- Permission composition
- Object-level authorization

#### Security

- Backend-only authorization
- Least privilege
- Queryset scoping
- IDOR protection
- Separation of Django staff from application roles

#### Architecture

- Centralized reusable permission package
- Shared role permission classes
- Django Group data migration
- Role-based Post authorization
- Role-based Category authorization
- Role-based Tag authorization

#### Documentation

- API Specification synchronized through Feature 14 at completion time
- Architecture documentation synchronized through Feature 14 at completion time
- Authentication and authorization flows synchronized through Feature 14 at completion time
- Database design synchronized with Search, Media Uploads, and Django Group roles
- Comment–User physical deletion behavior documented as `CASCADE`
- Feature 15 identified as the next milestone at Feature 14 completion

#### Manual Testing

Successfully verified:

- Author permissions
- Editor permissions
- Administrator permissions
- Multiple-role users
- Category authorization
- Tag authorization
- Post authorization
- Queryset scoping
- Object ownership
- Permission composition

**Status:** Completed

---

## ✅ Feature 15 — User Administration & Role Management

### Objective

Convert the platform to a closed-registration editorial CMS and provide secure Administrator-only APIs for account provisioning, account activation, and application-role management.

### Completed

- Removed public registration (`POST /api/auth/register/`)
- Added Administrator-only create, list, and retrieve user APIs
- Added explicit activate and deactivate actions
- Added complete replacement of allowlisted application roles
- Restricted managed roles to Author, Editor, and Administrator
- Preserved unrelated Django Group memberships
- Added password, email, and duplicate-role validation
- Added atomic service-layer mutations and row locking
- Prevented self-deactivation and self-removal of Administrator access
- Protected the final active Administrator
- Added deterministic ordering and page-number pagination
- Excluded password, staff, superuser, direct-permission, and unrelated-Group data from responses
- Added Feature 15 completion report and ADR-019

**Status:** Completed

---

## ✅ Feature 16 — Performance Optimization

### Objective

Measure current API and PostgreSQL behavior and introduce evidence-based performance improvements without weakening authorization, visibility, correctness, or maintainability.

### Completed

- Audited pagination across all collection endpoints
- Captured runtime and response-size baselines for Posts, Comments, Categories, and Tags
- Added shared `StandardPageNumberPagination` infrastructure with a default page size of 20 and maximum of 100
- Explicitly paginated Post, Post Comment, Category, and Tag lists
- Retained specialized `10/50` Search pagination and `20/100` Administrator User pagination
- Preserved endpoint-level configuration without global DRF pagination settings
- Added `-pk` as the final Post ordering tie-breaker
- Added `-pk` as the final Search ordering tie-breaker
- Preserved deterministic Comment, Category, Tag, and Administrator User ordering
- Verified bounded Post and Comment responses through before-and-after measurements
- Verified that existing eager loading continues to prevent N+1 query growth
- Analyzed PostgreSQL full-text-search retrieval and count plans
- Confirmed selective and missing searches use `post_search_vector_gin`
- Confirmed broad searches may correctly use sequential scanning
- Preserved authentication, authorization, ownership, soft-delete, active-status, and queryset-scoping rules
- Completed manual functional pagination verification
- Deferred automated regression testing to the planned backend testing phase
- Added Feature 16 completion report and ADR-020

**Status:** Completed

---

## ✅ Frontend Feature 01 — React Foundation & Frontend Architecture

### Objective

Establish a validated, maintainable React application foundation without prematurely implementing authentication or API-driven features.

### Completed

* React 19 and Vite 8 application startup through ES modules and Strict Mode
* React Router 8 Data Mode with one centralized `createBrowserRouter`
* Nested root layout with shared header, `Outlet`, and footer
* Home index route, wildcard Not Found route, and route-level error boundary
* Tailwind CSS 4 through the first-party Vite plugin and minimal global CSS
* Required `VITE_API_BASE_URL` example, build-time validation, runtime validation, and normalization
* Absolute HTTP(S)-only configuration with embedded credentials rejected
* One shared Axios client with a 10-second timeout and JSON Accept header
* Multipart-safe request defaults with no global `Content-Type`
* Separate browser and Node.js ESLint environments
* Successful lint, production build, environment-failure, routing, navigation, and ignore verification
* ADR-021, Feature Completion Report, and synchronized project documentation

At the completion of Frontend Feature 01, authentication, token storage, protected routes, and real API requests had not yet been implemented. Frontend Feature 02 supersedes that historical state.

---

## ✅ Frontend Feature 02 — Authentication & Session Architecture

### Objective

Integrate the React application with the existing Django REST Framework and Simple JWT authentication APIs without weakening backend authority.

### Completed

* Backend prerequisites: managed Django Group roles on `/api/auth/me/`, development CORS for `http://localhost:5173`, and successful-login `last_login` updates
* Central `checking`, `authenticated`, and `unauthenticated` AuthProvider state machine
* Module-memory access token and namespaced localStorage refresh token (`blog-platform.auth.refresh-token`)
* Startup restoration through one rotating refresh followed by authoritative `/me/`
* Shared Axios bearer attachment, one in-tab refresh promise, one retry per request, authentication-endpoint exclusions, and provider invalidation
* Login form, safe return paths, protected and anonymous-only guards, role guard foundation, controlled 403 page, and responsive role-aware navigation
* Local-first logout that clears browser state even when server revocation fails
* Safe authentication-specific error normalization with no raw Axios objects, stack traces, or token values exposed to UI code
* Vitest, jsdom, React Testing Library, jest-dom, user-event, and Axios Mock Adapter testing foundation
* 12 automated test files with 135 tests covering storage, APIs, restoration, interceptors, guards, login, navigation, and security-sensitive negative paths
* 35/35 real-stack browser checks against live Vite and Django, including rotation, blacklisting, concurrent refresh, five role combinations, backend permission enforcement, CORS, logout failure, and restoration outage
* ADR-022, Feature Completion Report, and synchronized project documentation

Frontend role visibility is a user-experience control only. Django REST Framework permissions remain authoritative.

---

# Current Frontend Modules

| Area | Current status |
| --- | --- |
| Application foundation | `index.html` mounts `main.jsx`; React Strict Mode renders `App`. |
| Routing | Central Data Mode router with `/`, `/login`, protected `/unauthorized`, `*`, pathless authentication guards, safe return paths, and an error boundary. |
| Layout | Shared responsive header, authentication-aware navigation, main `Outlet`, and footer. |
| Authentication state | AuthProvider exposes authoritative current-user state, three lifecycle states, login/logout actions, safe errors, and independent role helpers. |
| Token storage | Access token in module memory only; rotating refresh token under one namespaced localStorage key; no persisted user data. |
| Pages | Home, Login, controlled Unauthorized, Not Found, and safe Route Error pages. |
| Configuration | Build-time and browser-runtime validation of the public API URL. |
| API integration | Login, `/me`, refresh, and logout functions plus a shared Axios client with bearer attachment, retry-once behavior, and single-flight refresh. |
| Route and role UX | Protected, anonymous-only, and any-role guard foundations; `/me` roles drive independent badges while backend permissions remain authoritative. |
| Styling | Tailwind CSS 4 utilities with minimal global base CSS. |
| Tooling | npm lockfile, Vite, ESLint, Vitest, jsdom, React Testing Library, Axios Mock Adapter, and lint/build/test scripts. |

---

# Current Backend Modules

| Module     | Status                                                             |
| ---------- | ------------------------------------------------------------------ |
| Core       | ✅ Completed                                                        |
| Users      | ✅ Completed                                                        |
| Posts      | ✅ Completed (Publishing, Categories, Tags, Search, Media Uploads)  |
| Categories | ✅ Completed                                                        |
| Tags       | ✅ Completed                                                        |
| Comments   | ✅ Completed                                                        |
| Profiles   | ✅ Completed                                                        |


---

# Current API Status

## Authentication APIs

Implemented

- POST `/api/auth/login/`
- GET `/api/auth/me/`
- POST `/api/auth/logout/`
- POST `/api/auth/token/refresh/`
- POST `/api/auth/token/verify/`

Public registration is closed; `/api/auth/register/` was removed in Feature 15. Login returns JSON access/refresh tokens, `/me/` returns the authoritative filtered application roles, refresh rotates and blacklists the previous refresh token, and logout requires both the bearer access token and submitted refresh token.

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
- GET `/api/posts/search/?q=<query>`
- PUT `/api/posts/{slug}/featured-image/`
- DELETE `/api/posts/{slug}/featured-image/`

Collection Pagination

- Post list: Standard pagination, default 20, maximum 100
- Post search: Specialized pagination, default 10, maximum 50

Taxonomy Support

- Assign categories using `category_slugs`
- Update or remove assigned categories
- Assign tags using `tag_slugs`
- Update or remove assigned tags
- Preserve taxonomy relationships when write fields are omitted
- Nested category and tag representations in list and detail responses
- Shared category and tag validation through `TaxonomyAssignmentMixin`

Featured Image Support

- Upload or replace a featured image
- Remove a featured image
- Public `featured_image_url` in list responses
- Public `featured_image_url` in detail responses
- Public `featured_image_url` in search responses
- Multipart upload support
- Author-only image management

---

## Categories APIs

Implemented

- POST /api/categories/
- GET /api/categories/
- GET /api/categories/{slug}/
- PATCH /api/categories/{slug}/

Category listing uses standard pagination with a default of 20 and maximum of 100.

---

## Tags APIs

Implemented

- POST /api/tags/
- GET /api/tags/
- GET /api/tags/{slug}/
- PATCH /api/tags/{slug}/

Tag listing uses standard pagination with a default of 20 and maximum of 100.

---

## Comments APIs

Implemented

* GET `/api/posts/{post_slug}/comments/`
* POST `/api/posts/{post_slug}/comments/`
* PATCH `/api/comments/{id}/`
* DELETE `/api/comments/{id}/`

Current behavior:

* Public Comment listing
* Standard Comment-list pagination with a default of 20 and maximum of 100
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

## User Administration APIs

Implemented (Administrator only)

- POST `/api/admin/users/`
- GET `/api/admin/users/`
- GET `/api/admin/users/{id}/`
- POST `/api/admin/users/{id}/activate/`
- POST `/api/admin/users/{id}/deactivate/`
- PUT `/api/admin/users/{id}/roles/`

Current behavior includes closed registration, active-user creation, specialized paginated listing with a default of 20 and maximum of 100, allowlisted role replacement, unrelated-Group preservation, idempotent activation/deactivation, self-protection, and last-active-Administrator protection.

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
 ├── Featured Image (ImageField)
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

### Search Infrastructure

Feature 12 introduces PostgreSQL Full-Text Search using:

- SearchVector
- SearchQuery
- SearchRank
- Weighted search fields
- English search configuration
- GIN index for optimized search performance

Search operates on:

- Post title
- Post excerpt
- Post content

No additional database tables were introduced.

### Media Infrastructure

Feature 13 introduces secure media management using:

- Django ImageField
- Django Storage API
- UUID-based filenames
- Date-based upload paths
- Pillow image validation
- Transaction-safe storage cleanup
- Storage abstraction for future cloud providers

The platform currently stores one optional featured image per Post.

### User Administration Infrastructure

Feature 15 introduces no new database tables.

It reuses:

- Custom User model
- User `is_active` field
- Django Group model
- User–Group many-to-many relationship

Application roles are represented by these Django Groups:

- Author
- Editor
- Administrator

User creation, activation, deactivation, and role replacement use transactional service-layer operations.

Role replacement modifies only application-managed Groups and preserves unrelated Django Group memberships.

### Performance Optimization Infrastructure

Feature 16 introduces no new business table, field, index, or constraint.

It adds a state-only migration for deterministic Post ordering:

```text
-published_at
-created_at
-pk
```

The migration changes Django model options and emits no physical schema SQL.

The existing `post_search_vector_gin` index was retained and verified through PostgreSQL execution plans. Selective and missing searches used the GIN index, while an 80%-selectivity search correctly used a sequential scan.

No speculative cache, stored search vector, or additional database index was introduced.

## Planned Tables

No additional database table was introduced by Frontend Features 01 or 02. Frontend Feature 02 uses Simple JWT's existing outstanding-token and blacklist tables; it introduced no business-schema migration.

# Authentication Status

## Authorization

Implemented

- Django Groups
- Role-Based Access Control (RBAC)
- Shared DRF permission classes
- Permission composition
- Queryset scoping
- Object-level permissions

## Implemented

- Custom User Model
- Email Authentication Backend
- JWT Authentication
- JWT Access Token
- JWT Refresh Token
- Seven-day refresh lifetime with rotation and old-token blacklisting
- Database-backed outstanding-token and blacklist state
- Current User Endpoint with filtered `Author`, `Editor`, and `Administrator` Group roles
- Successful-login `last_login` update
- React AuthProvider state machine and startup restoration
- Memory-only access token and namespaced localStorage refresh token
- Shared Axios bearer attachment, single-flight refresh, and retry-once coordination
- Local-first logout and safe authentication error normalization
- Protected/anonymous route guards and independent role-aware UX
- Development CORS for `http://localhost:5173` with credentials disabled

## Planned

- Password Change
- Password Reset
- Email Verification
- Multi-Factor Authentication (Optional)

---

# Documentation Status

## Core Documentation

| Document | Status | Coverage |
| -------- | ------ | -------- |
| README | ✅ Current | Project overview |
| Architecture | ✅ Current | Backend Features 01–16 and Frontend Features 01–02 |
| Database Design | ✅ Current | Features 01–16 |
| API Specification | ✅ Current | Exact authentication contracts, rotated refresh, `/me` roles, and implemented APIs through Feature 16 |
| Authentication Flow | ✅ Current | Backend JWT lifecycle and implemented React session architecture |
| Testing Strategy | ✅ Current | Backend manual strategy and Frontend Feature 02 automated/manual coverage |
| Project Status | ✅ Current | Frontend Feature 03 complete; next milestone awaits roadmap selection |
| Frontend README | ✅ Current | Frontend foundation and authentication developer guide |

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
- ✅ Feature 12 — Search
- ✅ Feature 13 — Media Uploads
- ✅ Feature 14 — Permissions & Authorization
- ✅ Feature 15 — User Administration & Role Management
- ✅ Feature 16 — Performance Optimization
- ✅ Frontend Feature 01 — React Foundation & Frontend Architecture
- ✅ Frontend Feature 02 — Authentication & Session Architecture

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
- ✅ ADR-013 — Post–Tag Relationship Architecture
- ✅ ADR-014 — Comments Domain Architecture
- ✅ ADR-015 — User Profiles Architecture
- ✅ ADR-016 — Post Search Architecture
- ✅ ADR-017 — Featured Image Architecture
- ✅ ADR-018 — Role-Based Authorization Architecture
- ✅ ADR-019 — User Administration and Role Management
- ✅ ADR-020 — Collection Pagination and Stable Ordering Architecture
- ✅ ADR-021 — Frontend Foundation and Architecture
- ✅ ADR-022 — Frontend Authentication and Session Architecture

---

# Testing Status

## Manual Testing

Completed for the Authentication, User Administration, Posts, Categories, Tags, Comments, and Profiles modules.

Verified:

### Authentication

- Historical public-registration coverage (endpoint removed in Feature 15)
- Login
- Logout
- Protected endpoints
- Token Refresh
- Token Verification

### User Administration

- Administrator-only access
- User creation with hashed passwords and optional roles
- Case-insensitive email uniqueness
- Weak-password, mismatch, invalid-role, and duplicate-role rejection
- Paginated user listing and safe detail responses
- Application-role replacement with unrelated-Group preservation
- Idempotent activation and deactivation
- Self-deactivation prevention
- Self-removal of Administrator role prevention
- Last-active-Administrator protection
- Transactional and concurrency-safe mutations

### Posts

- Standard pagination envelope for Post listing
- Default page size 20, custom `page_size`, and maximum page size 100
- Second-page, invalid-page, and empty-collection behavior
- Stable Post ordering
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
- PostgreSQL Full-Text Search
- Search relevance ranking
- Phrase search
- Multi-word search
- OR search
- Excluded-term search
- Search pagination
- Published-only visibility
- Soft-delete exclusion
- Featured image upload
- Featured image replacement
- Featured image removal
- UUID filename generation
- Image validation
- MIME validation
- Corrupted image rejection
- Dimension validation
- Pixel-count validation
- Animated image rejection
- Public image URL generation
- Search image URL generation
- Transaction-safe file cleanup
- Role-based authorization
- Editor override
- Author ownership
- Queryset scoping

### Categories

- Standard pagination envelope
- Default, custom, and maximum page sizes
- Second-page navigation
- Alphabetical paginated ordering
- Create
- List
- Retrieve
- Update
- Duplicate validation
- Slug generation
- Editor permissions
- Active category filtering


### Tags

- Standard pagination envelope
- Default, custom, and maximum page sizes
- Second-page navigation
- Alphabetical paginated ordering
- Create
- List
- Retrieve
- Update
- Duplicate validation
- Slug generation
- Editor permissions
- Active tag filtering

### Comments

- Standard pagination envelope
- Default, custom, and maximum page sizes
- Second-page navigation
- Stable chronological pagination
- Unpaginated creation responses
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

### Authorization

- Author role
- Editor role
- Administrator role
- Multiple role membership
- Permission composition
- Queryset scoping
- Object-level permissions
- IDOR protection

### Feature 16 Performance Verification

- Runtime Post and Comment baselines
- Before-and-after pagination measurements
- Query-count and response-size comparison
- Eager-loading and N+1 verification
- Category and Tag baseline measurements
- Maximum page-size enforcement
- PostgreSQL full-text-search execution plans
- Selective-term and missing-term GIN usage
- Broad-term sequential-scan behavior
- Pagination count-query plans
- Security and visibility preservation

---

### Frontend Feature 01 Verification

* Node `v24.18.0` and npm `11.16.0` verified during documentation completion
* Dependencies installed successfully and installation-time npm audit reported zero vulnerabilities
* ESLint passed
* Production build passed
* Missing `VITE_API_BASE_URL` caused the expected build failure after validation was introduced
* Restored environment configuration allowed lint and build to pass
* Home and wildcard routes manually verified
* Shared header and footer manually verified
* Client-side Return home navigation manually verified
* `.env.local`, `node_modules`, and `dist` confirmed ignored

No automated frontend tests were written during Frontend Feature 01 itself; the testing foundation arrived with Frontend Feature 02.

---

### Frontend Feature 02 Verification

* Vitest 4 with jsdom, React Testing Library, jest-dom, user-event, and Axios Mock Adapter
* 12 deterministic test files and 135 tests covering token storage, authentication APIs, error normalization, session restoration, AuthProvider behavior, Axios refresh coordination, invalidation, route guards, safe return paths, login, and navigation
* Strict Mode restoration and concurrent `401` single-flight coverage
* Negative security coverage for unavailable storage, external request origins, unsafe redirects, invalid/blacklisted refresh tokens, retry loops, and token exposure
* Real Vite frontend at `http://localhost:5173` against the live Django API at `http://127.0.0.1:8000/api`
* 35/35 sanitized headless Chromium checks across clean startup, validation, login, reload/rotation, controlled expired access, three concurrent protected requests, invalid and blacklisted refresh tokens, logout, failure recovery, roles, backend permission enforcement, responsive layout, and security inspection
* Development CORS preflight allowed the Vite origin, allowed authorization/content-type headers, omitted credential support, and omitted `Access-Control-Allow-Origin` for an unapproved origin
* Successful temporary-account logins updated `last_login`; the inactive account remained unchanged
* One real-stack defect corrected: the anonymous-only guard now preserves a safe attempted path when authentication completes; two route regression tests cover safe and unsafe state
* Temporary accounts, outstanding tokens, blacklisted tokens, browser profile, and verification processes were removed after the run

---

## Automated Testing

Frontend authentication automation is implemented: 12 files and 135 tests. Backend pagination, query-count, ordering, visibility, and performance regression automation remains deferred to the planned backend quality-assurance phase.

---

# Pending Features

## Frontend and Delivery Work

* Remaining frontend features
* Backend automated testing and quality-assurance phase
* Deployment and CI/CD

Deployment & CI/CD is intentionally deferred until backend and frontend development are complete.

---

# Current Milestone

✅ Frontend Feature 03 — Public Posts Module

Status: Public list/detail integration, URL-backed pagination, safe presentation, linting, production build, 166 automated tests, ADR-023, Feature Completion Report, and synchronized documentation completed. Interactive Feature 03 browser verification remains pending and is not claimed.

Frontend Feature 03 is complete. Backend automated regression testing and later roadmap-selected frontend work remain pending.

Deployment and CI/CD are intentionally deferred until backend and frontend development are complete.

---

# Current Project Status

The backend domain/API foundation through Feature 16 is complete. Frontend Features 01–03 now provide the React/Vite foundation, a verified authentication/session layer, and a public post list/detail module. The application can authenticate against the real Django API and browse published content anonymously through canonical paginated routes.

The public Posts module is the first completed business frontend module. Backend automated regression coverage, remaining roadmap-selected frontend modules, and deployment/CI/CD remain pending.

---

# Next Milestone

## Pending roadmap selection

### Objective

Select the next frontend feature from the project roadmap after review of Frontend Feature 03. No later feature scope is assumed by this status document.

### Planned Areas

* Review the completed authentication/session architecture and known limitations
* Choose the next user-facing module from the maintained frontend roadmap
* Define its backend contract, authorization boundary, loading/error behavior, and testing scope before implementation

### Engineering Rule

Do not infer a business feature or add speculative routes until the roadmap selection and API contract are explicit.

---

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
- Editor-managed taxonomy administration
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
- Dedicated Search API
- Custom PostQuerySet for reusable search logic
- Custom PostManager for domain-specific queries
- PostgreSQL Full-Text Search
- SearchVector, SearchQuery, and SearchRank
- Weighted search fields
- Web-style search queries
- Explicit PostgreSQL search configuration
- Search-specific pagination
- GIN index for search optimization
- Featured image support through `ImageField`
- UUID-based upload filenames
- Date-based upload directory structure
- Django Storage API abstraction
- Dedicated featured-image service layer
- Layered image validation
- Transaction-safe storage cleanup using `transaction.on_commit()`
- Dedicated featured-image upload endpoint
- Public `featured_image_url` representation
- Soft-delete image preservation
- Centralized shared permission package
- Django Groups as application roles
- Independent Author, Editor, and Administrator roles
- Role-based authorization
- Permission composition
- Queryset scoping for authorization
- Separation of authentication and authorization
- Separation of Django staff from application roles
- Backend-enforced RBAC
- Closed-registration CMS architecture
- Administrator-only user provisioning
- Separation of authentication and user administration APIs
- Dedicated `UserAdministrationService`
- Transactional user creation and role assignment
- Explicit activation and deactivation actions
- Idempotent account-status operations
- Application-role allowlisting through `APPLICATION_GROUPS`
- Complete application-role replacement through `PUT`
- Preservation of unrelated Django Groups
- Self-deactivation prevention
- Self-removal of Administrator-role prevention
- Last-active-Administrator protection
- Row locking through `select_for_update()`
- Administrator Group as a shared concurrency lock
- Paginated Administrator user listing
- Deterministic user ordering using `-date_joined` and `-pk`
- No user-deletion API
- Shared standard pagination infrastructure
- Explicit endpoint-level pagination
- No global DRF pagination policy
- Specialized Search and Administrator User pagination
- Deterministic ordering for standard paginated collections
- Stable Post ordering using `-published_at`, `-created_at`, and `-pk`
- Stable Search ordering using `-search_rank`, `-published_at`, `-created_at`, and `-pk`
- Evidence-driven performance optimization
- Existing GIN search index retained after execution-plan verification
- No speculative caching or database indexes

Detailed rationale for each decision is documented in the project's ADRs.

Frontend Feature 01 additionally accepts:

* React with Vite, JavaScript, npm, and a committed lockfile
* Tailwind CSS through the first-party Vite integration and minimal global CSS
* React Router Data Mode with centralized route objects, nested layout, wildcard page, and route error boundary
* One shared Axios instance with environment base URL, 10-second timeout, and no global `Content-Type`
* Required build-time and runtime validation of public `VITE_API_BASE_URL` configuration
* No Redux, TanStack Query, or global state before demonstrated requirements
* Authentication Context, JWT interceptors, and token storage were intentionally deferred to Frontend Feature 02 at that milestone
* Backend-authoritative security; frontend route visibility is never authorization
* Small responsibility-based folders now, with feature modules introduced only for real behavior

Frontend Feature 02 additionally accepts:

* Access tokens remain in module memory; only the rotating refresh token uses the namespaced `blog-platform.auth.refresh-token` localStorage key
* `/api/auth/me/` is the sole frontend authority for current identity and application roles; JWT role claims are not used
* One Strict Mode-safe restoration promise and one in-tab interceptor refresh promise coordinate rotation without duplicate use
* Login, logout, refresh, and verify requests, explicit Authorization requests, and retried requests are excluded from automatic refresh as appropriate
* A framework-independent invalidation bridge keeps Axios infrastructure free of React and navigation behavior
* Local logout is authoritative for browser state even when backend blacklisting cannot be confirmed
* Protected and role-aware frontend controls improve UX only; backend permissions remain authoritative
* Development CORS permits only `http://localhost:5173`, scopes headers to `/api/`, and keeps credentials disabled
* The accepted storage split fits the current JSON-token backend but retains localStorage XSS exposure; HttpOnly refresh cookies would be stronger if the backend contract changes
* Cross-tab refresh rotation, lost refresh-response ambiguity, and failed revocation while the backend is unavailable or the access token is expired remain documented limitations

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

**Starting Point:** Review the completed Frontend Feature 03 report and select the next item from the maintained frontend roadmap. No next feature is assumed here. Deployment and CI/CD remain deferred.

---

# Current Frontend Update — Frontend Feature 03

Frontend Feature 03 — Public Posts Module is complete.

Implemented:

* public `/posts` and `/posts/:postSlug` routes in the centralized router;
* exact shared-client adapters for `GET /api/posts/` and `GET /api/posts/{slug}/`;
* URL-owned, canonical page-number navigation using the backend's 20-item standard pagination;
* loading, success, empty, retryable error, invalid-page recovery, and detail-not-found states;
* abortable request effects and stale-response protection;
* post cards, metadata, taxonomy, featured-image fallback, and readable detail presentation;
* plain-text content rendering and credential-free absolute HTTP(S) image URL validation;
* primary-navigation access for anonymous and authenticated visitors;
* ADR-023 and the Frontend Feature 03 completion report.

Verification:

* focused Feature 03 suite: 6 files, 31 tests passed;
* full frontend regression: 18 files, 166 tests passed;
* ESLint: passed;
* Vite production build: passed, 168 modules transformed;
* interactive browser/manual matrix: pending because a browser session with a seeded running backend was unavailable; no manual result is claimed.

No backend file, database model, migration, authentication contract, route guard, token lifecycle, or permission rule changed. `docs/Database-Design.md` and `docs/Authentication-Flow.md` were reviewed and require no Feature 03 changes. The next frontend milestone awaits roadmap selection; deployment remains deferred.
