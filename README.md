# Production-Grade Blog Platform

A production-grade **API-first Blog Platform** built with **Django REST Framework** and **React**.

The project demonstrates real-world software engineering practices, including scalable architecture, secure authentication, clean code, testing, documentation, and maintainability.

---

# Tech Stack

## Backend

* Django
* Django REST Framework (DRF)
* PostgreSQL
* JWT Authentication (Simple JWT)
* Custom User Model
* Email-based Authentication
* Django Group-Based Application Roles
* Backend-Enforced Role and Ownership Permissions

## Frontend

* React 19
* Vite 8
* React Router 8
* Tailwind CSS 4
* Axios
* ESLint
* Vitest
* React Testing Library

---

# Architecture Overview

## Design Principles

* API-First Architecture
* Modular Django Applications
* Separation of Concerns
* Environment-Based Configuration
* Scalable Project Structure
* Security-First Development

## System Flow

```text
React Frontend
       │
       ▼
Django REST Framework API
       │
       ▼
Business Logic
       │
       ▼
PostgreSQL Database
```

---

# Authentication

The project currently includes:

* Custom User Model
* Email-based Login
* JWT Access Tokens
* JWT Refresh Tokens
* Protected API Endpoints
* Refresh Token Blacklisting
* Current User Endpoint (`/api/auth/me/`)
* Application roles from Django Groups through `/api/auth/me/`
* Frontend session restoration and automatic access-token refresh
* Frontend route guards and role-aware user experience

The React client keeps the access token in module memory and persists only the refresh token under the namespaced localStorage key `blog-platform.auth.refresh-token`. The backend remains the final authority for authentication and authorization; frontend guards and role visibility are user-experience controls only.

# Current Capabilities

The platform currently supports:

* JWT-based authentication
* Email-based login
* Three-state frontend authentication (`checking`, `authenticated`, and `unauthenticated`)
* Login, browser-session restoration, logout, and safe authentication errors
* Single-flight refresh-token rotation and one-time Axios interceptor installation
* Safe protected, anonymous-only, and role-aware route guards
* Current-user and independent application-role navigation
* Draft post creation
* Public listing of published posts
* Slug-based post retrieval
* React public post listing and detail routes
* URL-backed public-post pagination with canonical page handling
* Abortable public-post requests, controlled retry states, and stale-response protection
* Safe plain-text post rendering and validated HTTP(S) featured-image URLs
* Author-only post updates
* Author-only soft deletion
* Publish and unpublish workflows
* Backend-enforced ownership validation
* Automatic publication timestamp management
* Public category browsing
* Staff-managed category creation and updates
* Slug-based category retrieval
* Reusable category taxonomy
* Public tag browsing
* Staff-managed tag creation and updates
* Slug-based tag retrieval
* Reusable tag taxonomy
* Assign categories to posts
* Update post categories
* Remove post categories
* Slug-based category assignment
* Nested category representation in post responses
* Many-to-many Post ↔ Category relationship
* Optimized category loading using `prefetch_related()`
* Assign tags to posts
* Update post tags
* Remove post tags
* Slug-based tag assignment
* Nested tag representation in post responses
* Many-to-many Post ↔ Tag relationship
* Shared taxonomy validation through serializer mixins
* Optimized tag loading using `prefetch_related()`
* Public Comment listing on published Posts
* Authenticated Comment creation
* Author-owned Comment updates
* Author-owned Comment soft deletion
* Post–Comment one-to-many relationship
* User–Comment one-to-many relationship
* Backend-controlled Comment author assignment
* Backend-controlled parent Post assignment
* Published-Post validation
* Comment ownership enforcement through `IsCommentAuthor`
* Comment audit tracking
* Comment soft-delete lifecycle
* Optimized Comment loading using `select_related()`
* Authenticated Profile retrieval
* Authenticated Profile updates
* Public User Profile viewing
* One-to-One User ↔ Profile relationship
* Automatic Profile creation through Django signals
* Existing User Profile backfill migration
* Public and private Profile representations
* Profile ownership enforcement through authenticated User context
* Future date-of-birth validation
* Optimized Profile loading using `select_related()`

---

# Completed Features

* ✅ Feature 00 — Project Dashboard
* ✅ Feature 01 — Project Foundation & Architecture
* ✅ Feature 02 — Custom User Model & User App Architecture
* ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs
* ✅ Feature 04 — Posts Domain Architecture & Database Design
* ✅ Feature 05 — Publishing Workflow
* ✅ Feature 06 — Categories
* ✅ Feature 07 — Tags
* ✅ Feature 08 — Post–Category Relationship
* ✅ Feature 09 — Post–Tag Relationship
* ✅ Feature 10 — Comments
* ✅ Feature 11 — User Profiles
* ✅ Feature 12 — Search
* ✅ Feature 13 — Media Uploads
* ✅ Feature 14 — Permissions & Authorization
* ✅ Feature 15 — User Administration & Role Management
* ✅ Feature 16 — Performance Optimization
* ✅ Frontend Feature 01 — React Foundation & Frontend Architecture
* ✅ Frontend Feature 02 — Authentication & Session Architecture
* ✅ Frontend Feature 03 — Public Posts Module
* ✅ Frontend Feature 04 — Comments Module

---

# Project Structure

```text
blog-platform/
│
├── backend/
│   ├── apps/
│   │   ├── core/
│   │   ├── users/
│   │   ├── posts/
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── comments/
│   │   └── profiles/
│   │
│   ├── config/
│   │   └── settings/
│   │       ├── base.py
│   │       ├── development.py
│   │       └── production.py
│   │
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   │
│   ├── .env
│   ├── .env.example
│   └── manage.py
│
├── frontend/
│
├── docs/
│   ├── ADR/
│   ├── feature/
│   ├── API-Specification.md
│   ├── Authentication-Flow.md
│   ├── Testing-Strategy.md
│   └── ...
│
└── README.md
```

---

# Frontend Development

The frontend lives in `frontend/`. Its current source structure is:

```text
frontend/
├── src/
│   ├── config/
│   ├── features/
│   │   ├── auth/
│   │   └── posts/
│   │       ├── api/
│   │       ├── components/
│   │       ├── pages/
│   │       └── utils/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   ├── routes/
│   └── test/
├── .env.example
├── package.json
└── vite.config.js
```

Install and configure it from that directory:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
```

`VITE_API_BASE_URL` is required and must be an absolute HTTP(S) URL without embedded credentials. `VITE_` values are public browser configuration, not secrets; `.env.local` is ignored.

```text
npm run dev      Start the Vite development server
npm run lint     Run ESLint
npm run build    Create the production bundle
npm run test     Run the Vitest suite once
npm run test:watch  Run Vitest in watch mode
npm run preview  Preview the production bundle locally
```

The current frontend preserves the Feature 01 foundation and Feature 02 authentication architecture, then adds Frontend Feature 03 public post browsing. `/posts` and `/posts/:postSlug` use the shared Axios client, URL-owned page state, abortable requests, controlled loading/empty/error/not-found states, and plain-text content rendering. No new global state or server-state dependency was introduced.

Authentication follows these flows:

```text
Login:   POST /auth/login/ -> store access in memory and refresh in localStorage -> GET /auth/me/
Reload:  read refresh -> POST /auth/token/refresh/ -> replace both rotated tokens -> GET /auth/me/
Request: attach in-memory bearer token -> eligible 401 -> one shared refresh -> retry once
Logout:  POST /auth/logout/ with bearer and refresh -> always clear local authentication state
```

`/auth/me/` is authoritative for the current user and the independent `Author`, `Editor`, and `Administrator` roles. The nested login user is not used for role decisions, and roles are not decoded from JWT claims.

Development CORS permits only `http://localhost:5173` for `/api/` requests. Credentials remain disabled, no wildcard origin is enabled, and production inherits an empty CORS origin allowlist.

The frontend suite currently contains 18 test files with 166 passing tests. The earlier real frontend/backend authentication matrix also passed 35 of 35 checks. Feature 03 browser verification remains a documented manual follow-up where an interactive browser and seeded backend are available.

Known limitations include localStorage refresh-token exposure if script execution is compromised, no cross-tab refresh-rotation coordination, ambiguity when a rotated refresh response is lost, and incomplete server revocation when logout cannot reach the backend or lacks a usable access token. The role guard and role helpers are implemented, but no business-domain role-protected route is mounted yet.

---

# Current API

Implemented APIs:

### Authentication

```text
POST   /api/auth/login/
GET    /api/auth/me/
POST   /api/auth/logout/
POST   /api/auth/token/refresh/
POST   /api/auth/token/verify/
```

`POST /api/auth/register/` was removed. User creation is administrator-controlled.

Login accepts only `email` and `password`, returns `access`, `refresh`, and a nested basic user, and updates `last_login`. `/api/auth/me/` returns the authoritative current-user fields plus application-managed role names. Refresh accepts the current `refresh` token and returns both a replacement `access` and rotated `refresh` token. Logout requires the bearer access token and the current refresh token, then blacklists that refresh token when the backend request succeeds.
### Posts

```text
POST    /api/posts/
GET     /api/posts/
GET     /api/posts/{slug}/
PATCH   /api/posts/{slug}/
DELETE  /api/posts/{slug}/
POST    /api/posts/{slug}/publish/
POST    /api/posts/{slug}/unpublish/
```

Supports:

- Category assignment through `category_slugs`
- Category updates
- Category removal
- Nested category responses
- Tag assignment through `tag_slugs`
- Tag updates
- Tag removal
- Nested tag responses
- Shared taxonomy validation

### Categories

```text
GET     /api/categories/
GET     /api/categories/{slug}/
POST    /api/categories/
PATCH   /api/categories/{slug}/
```

### Tags

```text
GET     /api/tags/
GET     /api/tags/{slug}/
POST    /api/tags/
PATCH   /api/tags/{slug}/
```

Additional APIs will be introduced as future features are completed.

---

### Comments

```text
GET     /api/posts/{post_slug}/comments/
POST    /api/posts/{post_slug}/comments/
PATCH   /api/comments/{id}/
DELETE  /api/comments/{id}/
```

Supports:

* Public Comment listing
* Authenticated Comment creation
* Author-only Comment updates
* Author-only Comment soft deletion
* Published-Post validation
* Backend-controlled Comment author and Post assignment
* Object-level ownership enforcement
* Soft-deleted Comment exclusion

---

### Profiles

```text
GET     /api/profile/
PATCH   /api/profile/

GET     /api/users/{username}/profile/
```

Supports:

* Authenticated Profile retrieval
* Authenticated Profile updates
* Public Profile viewing
* Profile ownership enforcement
* Public/private Profile serialization
* Automatic Profile creation
* Date-of-birth validation
* Query optimization using select_related()

---

# Documentation

Project documentation is maintained under the `docs/` directory.

Key documents include:

* API Specification
* Authentication Flow
* Testing Strategy
* Architecture Decision Records (ADRs)
* Feature Completion Reports

Documentation is updated incrementally as each feature is completed.

---

# Roadmap

Frontend Feature 03 — Public Posts Module is complete. The next frontend milestone is pending roadmap selection.

Deployment and CI/CD are intentionally deferred until backend and frontend development are complete.

Historical roadmap items below are already implemented on the backend:

Upcoming features include:

* Search
* Media Uploads
* Permissions & Authorization
* Performance Optimization
* Deployment
* CI/CD

---

# Development Philosophy

This project emphasizes:

* Clean Architecture
* SOLID Principles
* REST API Best Practices
* Security
* Scalability
* Maintainability
* Testability
* Production-Ready Engineering Practices

---

# Current Status

**Authoritative Current Milestone:** ✅ Frontend Feature 04 — Comments Module

The backend is complete through Feature 16 — Performance Optimization. Frontend Feature 01 established the verified React/Vite foundation. Frontend Feature 02 implements login, auth context, session restoration, and token refresh. Frontend Feature 03 adds public post browsing. Frontend Feature 04 adds public comment listing on post detail pages, URL-backed comments pagination, authenticated comment creation, owner comment editing and deletion, permission-aware UI controls, XSS safety, and isolated request error boundaries.

The older milestone narrative retained below is historical backend feature context and is superseded by this update.

**Historical Backend Milestone:** ✅ Feature 11 — User Profiles

The blog platform now includes production-ready authentication, Posts, Categories, Tags, taxonomy relationships, and Comments.

Implemented capabilities include:

* Slug-based post URLs
* Draft and published post lifecycle
* Publish and unpublish workflows
* Backend-enforced status transitions
* Automatic publication timestamp management
* Public read access for published posts
* Author ownership enforcement
* Object-level permissions
* Soft delete with audit trail
* Optimized querysets using `select_related()`
* Public category listing and retrieval
* Staff-managed category administration
* Slug-based category URLs
* Active category management
* Public tag listing and retrieval
* Staff-managed tag administration
* Slug-based tag URLs
* Active tag management
* Post ↔ Category many-to-many relationship
* Category assignment using slugs
* Category relationship validation
* Nested category serialization
* Category relationship updates
* Post ↔ Tag many-to-many relationship
* Tag assignment using slugs
* Tag relationship validation
* Nested tag serialization
* Tag relationship updates
* Shared taxonomy validation mixin
* Optimized querysets using `select_related()` and `prefetch_related()`
* Independent Comments domain
* Public Comment listing
* Authenticated Comment creation
* Comment author ownership
* Author-only Comment updates
* Author-only Comment soft deletion
* Post–Comment one-to-many relationship
* User–Comment one-to-many relationship
* Published-Post validation
* Backend-controlled author and Post assignment
* Comment audit tracking
* Comment soft deletion
* Comment query optimization with `select_related()`

The blog platform now includes a dedicated User Profiles domain built around a one-to-one relationship with the custom User model.

Implemented Profile capabilities include:

* Automatic Profile creation for new Users
* Existing User Profile backfill migration
* Authenticated Profile retrieval
* Authenticated Profile updates
* Public User Profile viewing
* Public/private Profile serialization
* Profile ownership enforcement
* Date-of-birth validation
* Query optimization using `select_related()`
* Django Admin integration for Profile management

The historical next milestone at that point was **Feature 12 — Search**, which is now complete.

Feature 12 subsequently introduced search capabilities across the platform while maintaining performance, scalability, and clean API design.
