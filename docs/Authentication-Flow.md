# Authentication Flow

# Authentication Overview

The Blog Platform uses Django's authentication system together with Django REST Framework and Simple JWT to provide secure JWT-based authentication between the React frontend and Django backend.

Authentication was fully implemented in Feature 03 and now serves as the security foundation for all protected APIs across the platform.

Feature 04 introduced JWT authentication and object-level authorization for the Posts APIs.

Feature 05 extends this foundation by securing the publishing workflow, allowing only authenticated post authors to publish and unpublish their own posts while enforcing backend business rules for valid status transitions.

Feature 06 introduced public taxonomy reads. Feature 14 now restricts Category writes to authenticated Editors rather than Django staff users.

Feature 07 introduced the same public-read model for Tags. Feature 14 now restricts Tag writes to authenticated Editors.

Feature 08 introduced Post–Category assignment. Authors may assign active Categories to owned Posts, and Editors may do so for any active Post.

Feature 09 introduced Post–Tag assignment under the same Author-ownership and Editor-override rules.

Feature 10 extends the authorization architecture through the Comments domain. Public users may list comments attached to published posts, while authenticated users may create comments. Comment updates and soft deletion are restricted to the Comment author through backend-enforced object-level permissions.

Feature 11 extends the authentication and authorization architecture through the Profiles domain. Authenticated users may retrieve and update their own Profile, while public users may retrieve a safe public Profile representation by username. Profile ownership is enforced through `request.user`, and clients cannot select Profiles through User IDs or Profile IDs.

---

# Current Status (Feature 15)

## Completed

* ✅ Custom User application created
* ✅ Custom User model implemented
* ✅ User model inherits from `AbstractUser`
* ✅ `AUTH_USER_MODEL` configured before the first migration
* ✅ Authentication architecture established
* ✅ Email-based authentication
* ✅ Custom Email Authentication Backend
* ✅ Administrator-controlled User Creation API
* ✅ User Login API
* ✅ JWT Authentication
* ✅ JWT Access Token
* ✅ JWT Refresh Token
* ✅ Current User API (`/api/auth/me/`)
* ✅ Logout API
* ✅ Refresh Token Blacklisting
* ✅ Token Refresh Endpoint
* ✅ Token Verify Endpoint
* ✅ User Profile domain implemented
* ✅ One-to-One User–Profile relationship implemented
* ✅ Automatic Profile creation for new Users
* ✅ Existing User Profile backfill migration
* ✅ Authenticated Profile retrieval API
* ✅ Authenticated Profile update API
* ✅ Public Profile retrieval API
* ✅ Public/private Profile response separation
* ✅ Profile ownership enforcement through `request.user`

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
Authentication and Administration APIs
(Login / Logout / Me / Administrator User Provisioning)
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

* Profile expansion through a dedicated one-to-one Profile domain
* Flexible authentication options
* User-facing role administration APIs
* JWT compatibility
* Enterprise scalability
* Avoid changing the user model after migrations

Implementing the custom User model before the initial migration is considered a Django best practice.

---

# Authentication Features

## Implemented

* Administrator-controlled User Creation
* User Login
* JWT Access Token
* JWT Refresh Token
* Protected User Endpoint
* Logout
* Refresh Token Blacklisting
* Token Refresh
* Token Verification
* Authenticated Profile Retrieval
* Authenticated Profile Updates
* Public User Profile Retrieval
* Automatic Profile Provisioning

## Planned

* Password Change
* Password Reset
* Email Verification

---

# JWT Authentication Flow

Feature 15 removes public self-registration. Accounts are provisioned only by an authenticated Administrator through `POST /api/admin/users/`. Identity fields, password strength and confirmation, email uniqueness, and allowlisted roles are validated before the user and initial roles are created atomically.

The administration API also provides protected listing and retrieval, idempotent activation/deactivation, and complete replacement of application-managed roles. It does not expose staff or superuser state, direct permissions, arbitrary Groups, general account editing, or deletion.

An Administrator cannot deactivate themselves or remove their own Administrator role. No operation may leave the platform without an active Administrator; target User and Administrator Group row locks serialize concurrent changes that could violate this invariant. Inactive users cannot authenticate to obtain new JWTs.

---

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
* Editor-only authorization for category management
* Public read access for active categories
* Editor-only authorization for tag management
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
* Require authentication for Comment creation, updates, and deletion.
* Allow public Comment listing only through published, non-deleted Posts.
* Assign Comment authors from `request.user`.
* Resolve the parent Post from the URL instead of request data.
* Enforce Comment ownership through `IsCommentAuthor`.
* Prevent users from updating or deleting Comments owned by another user.
* Prevent Post authors from automatically modifying Comments written by other users.
* Prevent Comment author and Post reassignment.
* Return `404 Not Found` for invalid, draft, unpublished, or soft-deleted parent Posts.
* Exclude soft-deleted Comments from normal API querysets.
* Avoid exposing User email addresses and Comment audit fields in public responses.
* Require JWT authentication for private Profile retrieval and updates.
* Resolve the private Profile from `request.user`.
* Prevent clients from selecting Profiles through User IDs or Profile IDs.
* Prevent Profile ownership reassignment.
* Exclude email and date of birth from public Profile responses.
* Expose private Profile information only to the authenticated owner.
* Validate Profile website URLs on the backend.
* Reject future dates of birth.
* Treat Profile bio and location values as untrusted user-generated text.
* Avoid rendering Profile bio with `dangerouslySetInnerHTML` unless sanitization is introduced.

---

# Authorization Strategy

Authentication is complete.

Feature 04 introduced object-level authorization; Feature 14 extends it with centralized role-based access control.

Current authorization capabilities include:

* Public read access for published posts.
* Authenticated Authors and Editors can create Posts.
* Authors can manage owned Posts; Editors can manage any active, non-deleted Post.
* Ownership and Editor override are enforced by `IsPostAuthor`.
* Publishing state transitions are validated on the backend to prevent invalid workflow changes.
* Public read access for active categories.
* Only Editors can create or update Categories.
* Category management is enforced through shared `IsEditorOrReadOnly`.
* Public read access for active tags.
* Only Editors can create or update Tags.
* Tag management is enforced through shared `IsEditorOrReadOnly`.
* Authenticated post authors may assign active categories to their own posts.
* Only active categories may be assigned through the Posts API.
* Category assignments are validated through serializers before persistence.
* Category administration requires the Editor role.
* Posts may reference categories, but Posts APIs cannot create or modify Category records.
* Post queryset scoping and object permissions protect category assignment updates.
* Authenticated post authors may assign active tags to their own posts.
* Only active tags may be assigned through the Posts API.
* Tag assignments are validated through serializers before persistence.
* Tag administration requires the Editor role.
* Posts may reference tags, but Posts APIs cannot create or modify Tag records.
* Post queryset scoping and object permissions protect tag assignment updates.
* Shared taxonomy validation is implemented through reusable serializer mixins.
* Public users may list Comments attached to published, non-deleted Posts.
* Only authenticated users may create Comments.
* Comment authors are assigned by the backend through `request.user`.
* Parent Posts are resolved by the backend through the URL slug.
* Only the Comment author may update a Comment.
* Only the Comment author may soft delete a Comment.
* Comment ownership is enforced through the `IsCommentAuthor` object-level permission class.
* Post ownership does not grant permission over another user's Comment.
* Invalid, draft, unpublished, and soft-deleted Posts are hidden behind `404 Not Found`.
* Soft-deleted Comments are excluded from normal API querysets.
* Comment moderation remains deferred; current Comment updates and deletion remain author-only.
* Authenticated users may retrieve their own Profile.
* Authenticated users may partially update their own Profile.
* Private Profile ownership is derived from `request.user`.
* Clients cannot select another Profile by changing a URL identifier or request field.
* Public users may retrieve safe Profile information by username.
* Public Profile responses exclude email and date of birth.
* Public Profile endpoints are read-only.
* Profile ownership fields cannot be reassigned through serializers.


The implemented application roles are Author, Editor, and Administrator. Future APIs will provide safe Administrator-only user and role management.

## Role-Based Authorization Flow

JWT authentication establishes identity; it does not grant a business role. After token validation, DRF evaluates role permissions backed by Django Group membership.

```text
Bearer access token
        │
        ▼
JWTAuthentication
        │
        ▼
Authenticated User
        │
        ▼
Role permission
Author OR Editor OR Administrator
        │
        ▼
Authorization-scoped queryset
        │
        ▼
Object-level permission
        │
        ▼
Serializer and business validation
```

The roles are independent:

* `Author` creates Posts and manages only owned Posts.
* `Editor` creates Posts, manages any active Post, and manages Categories and Tags.
* `Administrator` is reserved for future user administration and does not inherit Editor access.

A user may belong to multiple groups. Roles may be assigned only through the Administrator user-management API; normal authentication and Profile APIs cannot modify Group membership.

For Post management, the effective rule is:

```text
Authenticated
AND (Author OR Editor)
AND (Post owner OR Editor)
```

The queryset is also scoped: Editors can resolve every active Post, while Authors can resolve only owned Posts. This normally turns cross-owner access into `404 Not Found` and reduces IDOR exposure.

Django `is_staff` controls Django Admin access only. It does not grant Editor or Administrator API privileges. Likewise, an application Administrator is not automatically a Django staff user or superuser.

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
* ✅ Feature 10 — Comments
* ✅ Feature 11 — User Profiles
* ✅ Feature 12 — Search
* ✅ Feature 13 — Media Uploads
* ✅ Feature 14 — Permissions & Authorization
* ✅ Feature 15 — User Administration & Role Management

## Current Authentication State

Authentication module fully implemented.

The application now supports:

- Administrator-controlled user provisioning
- User login
- JWT authentication
- Protected endpoints
- JWT access-token refresh
- Refresh-token blacklisting
- Token blacklisting
- Role-based and ownership-based authorization for Posts APIs
- Object-level permission enforcement
- Owner-Author or Editor publishing and unpublishing workflows
- Backend validation of publishing state transitions
- Editor-only category management
- Public category browsing
- Action-based permission selection
- Editor-only tag management
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
- Public Comment listing on published Posts
- Authenticated Comment creation
- Backend-controlled Comment author assignment
- Backend-controlled parent Post assignment
- Comment author ownership enforcement
- Author-only Comment updates
- Author-only Comment soft deletion
- Published-Post validation for Comment access
- Object-level Comment permission enforcement through `IsCommentAuthor`
- Authenticated Profile retrieval
- Authenticated Profile updates
- Public User Profile retrieval
- Automatic Profile creation for new Users
- Existing User Profile backfill
- Backend-controlled Profile ownership
- Public/private Profile response separation
- Profile privacy enforcement
- Profile update validation
- Independent Author, Editor, and Administrator roles
- Shared DRF role permission classes
- Author-or-Editor Post creation
- Editor override for Post management
- Authorization-scoped Post querysets
- Separation of Django staff access from application roles

---

# Comment Authorization Flow

## Create Comment

```text
Authenticated User
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
Validate Comment content
        │
        ▼
Assign request.user as author
        │
        ▼
Create Comment
```

## Update or Delete Comment

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
Update or soft delete Comment
```

Authentication establishes the user's identity, while `IsCommentAuthor` determines whether that user may modify the specific Comment.

---

# Profile Authorization Flow

## Retrieve Private Profile

```text
Authenticated User
        │
        ▼
GET /api/profile/
        │
        ▼
JWT Authentication
        │
        ▼
request.user
        │
        ▼
Resolve request.user Profile
        │
        ▼
Private Profile Serializer
        │
        ▼
200 OK
```

The private Profile endpoint derives ownership from the authenticated User. The client does not provide a User ID, Profile ID, or username.

---

## Update Private Profile

```text
Authenticated User
        │
        ▼
PATCH /api/profile/
        │
        ▼
JWT Authentication
        │
        ▼
Resolve Profile from request.user
        │
        ▼
Validate writable Profile fields
        │
        ▼
Update Profile
        │
        ▼
Return private Profile representation
```

Writable fields are limited to:

* `bio`
* `website`
* `location`
* `date_of_birth`

The client cannot update:

* Profile owner
* Username
* Email
* Created timestamp
* Updated timestamp

---

## Retrieve Public Profile

```text
Public Client
        │
        ▼
GET /api/users/{username}/profile/
        │
        ▼
Resolve Profile by username
        │
        ▼
Public Profile Serializer
        │
        ▼
Safe public response
```

Public Profile responses include:

* Username
* Bio
* Website
* Location

Public Profile responses exclude:

* Email
* Date of birth
* Internal identifiers
* System timestamps

---

# Authentication API Flow

```text
Administrator provisions user
    │
    ▼
Active user created
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
Profile APIs reuse the existing JWT authentication foundation. Feature 11 does not introduce new token types or modify the access-token, refresh-token, or logout workflows.

## Next Feature

Feature 16 will focus on performance optimization while retaining the current closed-registration, JWT, ownership, and role-based authorization model.
