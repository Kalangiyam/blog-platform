# Authentication Flow

# Authentication Overview

The Blog Platform uses Django's authentication system together with Django REST Framework and Simple JWT to provide secure JWT-based authentication between the React frontend and Django backend.

Authentication was fully implemented in Feature 03 and now serves as the security foundation for all protected APIs across the platform.

Feature 04 introduced JWT authentication and object-level authorization for the Posts APIs.

Feature 05 extends this foundation by securing the publishing workflow, allowing only authenticated post authors to publish and unpublish their own posts while enforcing backend business rules for valid status transitions.

Feature 06 extends the authorization layer by introducing the Categories domain. Category listing and retrieval are publicly accessible, while category creation and updates are restricted to staff users through backend-enforced permissions.

Feature 07 extends the same authorization model to the Tags domain. Tag listing and retrieval are publicly accessible, while tag creation and updates are restricted to staff users through dedicated backend-enforced permissions.

Feature 08 extends the authorization model by introducing the Post–Category relationship. Authenticated post authors may assign active categories to their own posts, while category lifecycle management remains restricted to staff users.

Feature 09 extends the same taxonomy authorization model to the Post–Tag relationship. Authenticated post authors may assign active tags to their own posts, while tag lifecycle management remains restricted to staff users.

---

# Current Status (Feature 09)

## Completed

* ✅ Custom User application created
* ✅ Custom User model implemented
* ✅ User model inherits from `AbstractUser`
* ✅ `AUTH_USER_MODEL` configured before the first migration
* ✅ Authentication architecture established
* ✅ Email-based authentication
* ✅ Custom Email Authentication Backend
* ✅ User Registration API
* ✅ User Login API
* ✅ JWT Authentication
* ✅ JWT Access Token
* ✅ JWT Refresh Token
* ✅ Current User API (`/api/auth/me/`)
* ✅ Logout API
* ✅ Refresh Token Blacklisting
* ✅ Token Refresh Endpoint
* ✅ Token Verify Endpoint

## Remaining Authentication Features

The authentication foundation is complete.

Future authentication enhancements include:

* Password Change
* Password Reset
* Email Verification
* Multi-Factor Authentication (Optional)
* Social Authentication (Optional)

---

# Authentication Architecture

The authentication system follows a layered architecture.

```text
React Frontend
        │
        ▼
Authentication API
(Register / Login / Logout / Me)
        │
        ▼
Serializers
        │
        ▼
Email Authentication Backend
        │
        ▼
Custom User Model
        │
        ▼
PostgreSQL
```

The frontend communicates only with REST API endpoints.

All authentication, authorization, and permission checks are performed on the backend.

---

# Current Authentication Foundation

The authentication module is built on top of the custom User model and Django's authentication framework.

Authentication is performed using a custom Email Authentication Backend, while JWT access and refresh tokens are managed by Django REST Framework Simple JWT.

Why a custom User model?

* Future profile expansion
* Flexible authentication options
* Role-based permissions
* JWT compatibility
* Enterprise scalability
* Avoid changing the user model after migrations

Implementing the custom User model before the initial migration is considered a Django best practice.

---

# Authentication Features

## Implemented

* User Registration
* User Login
* JWT Access Token
* JWT Refresh Token
* Protected User Endpoint
* Logout
* Refresh Token Blacklisting
* Token Refresh
* Token Verification

## Planned

* Password Change
* Password Reset
* Email Verification
* Profile Editing

---

# JWT Authentication Flow

```text
React Frontend
        │
        ▼
Login Request
        │
        ▼
Email Authentication Backend
        │
        ▼
JWT Access Token
JWT Refresh Token
        │
        ▼
Protected API Requests
        │
        ▼
Access Token Expires
        │
        ▼
Refresh Token
        │
        ▼
New Access Token
        │
        ▼
Logout
        │
        ▼
Refresh Token Blacklisted
```

---

# Request Flow

login request:

```text
Client
   │
   ▼
POST /api/auth/login/
   │
   ▼
LoginAPIView
   │
   ▼
LoginSerializer
   │
   ▼
authenticate()
   │
   ▼
EmailBackend
   │
   ▼
Generate JWT Tokens
   │
   ▼
JSON Response
```

---

# Response Flow

successful authentication response:

```text
Client
   │
   ▼
Login Request
   │
   ▼
JWT Tokens Generated
   │
   ▼
Access Token
Refresh Token
User Information
   │
   ▼
React Stores Tokens
```

---

# Security Principles

The authentication system will follow these security practices:

* Backend authentication only
* Password hashing using Django
* JWT Access and Refresh Tokens
* Backend permission enforcement
* Token expiration
* Secure password validation
* Object-level permissions for resource ownership
* Ownership enforcement using `request.user`
* Action-based permission enforcement
* Never trust frontend validation
* Refresh token blacklisting
* Generic authentication error messages
* Custom email authentication backend
* Staff-only authorization for category management
* Public read access for active categories
* Staff-only authorization for tag management
* Public read access for active tags
* Validate category assignments on the backend
* Validate tag assignments on the backend
* Reject inactive categories during relationship assignment
* Reject inactive tags during relationship assignment
* Reject invalid category slugs during relationship assignment
* Reject invalid tag slugs during relationship assignment
* Reject duplicate category assignments
* Reject duplicate tag assignments
* Enforce post ownership before category relationship updates
* Enforce post ownership before tag relationship updates
* Separate category administration from category assignment responsibilities
* Separate tag administration from tag assignment responsibilities

---

# Authorization Strategy

Authentication is complete.

Feature 04 introduces the first authorization layer through object-level permissions.

Current authorization capabilities include:

* Public read access for published posts.
* Authenticated users can create posts.
* Only the author of a post can update, delete, publish, or unpublish it.
* Ownership is enforced using `request.user` together with a custom DRF permission class.
* Publishing state transitions are validated on the backend to prevent invalid workflow changes.
* Public read access for active categories.
* Only staff users can create or update categories.
* Category management is enforced using a dedicated DRF permission class.
* Public read access for active tags.
* Only staff users can create or update tags.
* Tag management is enforced using a dedicated DRF permission class.
* Authenticated post authors may assign active categories to their own posts.
* Only active categories may be assigned through the Posts API.
* Category assignments are validated through serializers before persistence.
* Category administration remains restricted to staff users.
* Posts may reference categories, but Posts APIs cannot create or modify Category records.
* Existing object-level permissions continue protecting post ownership during category updates.
* Authenticated post authors may assign active tags to their own posts.
* Only active tags may be assigned through the Posts API.
* Tag assignments are validated through serializers before persistence.
* Tag administration remains restricted to staff users.
* Posts may reference tags, but Posts APIs cannot create or modify Tag records.
* Existing object-level permissions continue protecting post ownership during tag updates.
* Shared taxonomy validation is implemented through reusable serializer mixins.

Future features will extend this authorization model with editor, moderator, and administrator roles.

---

# Current Project Status

## Completed

* ✅ Feature 01 — Project Foundation & Architecture
* ✅ Feature 02 — Custom User Model & User App Architecture
* ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs
* ✅ Feature 04 — Posts Domain Architecture & Database Design
* ✅ Feature 05 — Publishing Workflow
* ✅ Feature 06 — Categories
* ✅ Feature 07 — Tags
* ✅ Feature 08 — Post–Category Relationship
* ✅ Feature 09 — Post–Tag Relationship

## Current Authentication State

Authentication module fully implemented.

The application now supports:

- User registration
- User login
- JWT authentication
- Protected endpoints
- Refresh token rotation
- Token blacklisting
- Ownership-based authorization for Posts APIs
- Object-level permission enforcement
- Author-only publishing and unpublishing workflows
- Backend validation of publishing state transitions
- Staff-only category management
- Public category browsing
- Action-based permission selection
- Staff-only tag management
- Public tag browsing
- Dedicated tag permission enforcement
- Author-controlled category assignment
- Backend validation of category relationships
- Active category enforcement
- Ownership-protected category updates
- Separation between category management and category assignment
- Author-controlled tag assignment
- Backend validation of tag relationships
- Active tag enforcement
- Ownership-protected tag updates
- Separation between tag management and tag assignment
- Shared taxonomy validation through serializer mixins

# Authentication API Flow

```text
Register
    │
    ▼
User Created
    │
    ▼
Login
    │
    ▼
Access Token + Refresh Token
    │
    ▼
Protected APIs
    │
    ▼
Access Token Expires
    │
    ▼
Token Refresh
    │
    ▼
New Access Token
    │
    ▼
Logout
    │
    ▼
Refresh Token Blacklisted
```

## Next Feature

Feature 10 will introduce the Comments domain.

The existing authentication and authorization infrastructure will continue securing protected APIs while extending ownership validation to user-generated comments.

The authorization model established for posts, categories, and tags will provide the foundation for future comment ownership enforcement, moderation workflows, and advanced permission systems.
