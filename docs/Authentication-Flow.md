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

# Backend Authentication Status Through Feature 16

This section preserves the backend feature-history milestone. Frontend Feature 02 now integrates this authentication foundation as described later in this document.

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

The required authentication and account-security foundation is complete, including password change, password reset, email verification, and transactional refresh-token revocation for credential changes.

Future optional enhancements include:

* Multi-Factor Authentication
* Social Authentication

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
* Password Change
* Password Reset
* Email Verification
* Transactional fail-closed refresh-token revocation on password change/reset

## Planned

* Multi-Factor Authentication (Optional)
* Social Authentication (Optional)

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
Submit Current Refresh Token
        │
        ▼
New Access Token + Rotated Refresh Token
Submitted Refresh Token Blacklisted
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
Update User.last_login
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
Access Token → module memory only
Refresh Token → localStorage
Nested Login User → transitional only
   │
   ▼
GET /api/auth/me/
Authoritative Current User + Roles → AuthProvider
```

---

# Frontend Feature 02 Authentication and Session Flow

Frontend Feature 02 implements the browser session layer without changing the backend API, JWT payload, permission model, or token lifecycle. The React application uses three explicit authentication states: `checking`, `authenticated`, and `unauthenticated`. It does not use cookies or Django session authentication.

Its backend prerequisites add application-managed roles to `/api/auth/me/`, permit the Vite development origin through a narrow CORS allowlist, and make successful custom login update `User.last_login` through Django's standard helper. These changes preserve the existing login, refresh, verify, logout, JWT, and permission contracts.

## Token Storage

* The access token is held only in module memory and is never written to browser storage.
* The refresh token is stored in `localStorage` under `blog-platform.auth.refresh-token` so a page reload can attempt session restoration.
* The `AuthProvider` exposes authentication state and current-user data, not raw token values.
* Because roles can change independently of token issuance, `/api/auth/me/` is the authoritative source for the current user and their application-managed roles. Roles are not JWT custom claims.

Persisting the refresh token permits restoration across reloads but makes it reachable by JavaScript. Content Security Policy, dependency hygiene, output encoding, and prevention of script injection therefore remain important controls. Session state is tab-local; concurrent refreshes from separate tabs can race because the backend rotates and blacklists refresh tokens.

## Startup Restoration

```text
Application mounts
      │
      ▼
Auth status = checking
      │
      ▼
Stored refresh token present?
   ├── No ──▶ clear transient state ──▶ unauthenticated
   └── Yes
          │
          ▼
POST /api/auth/token/refresh/
          │
          ▼
Persist rotated refresh + hold access in memory
          │
          ▼
GET /api/auth/me/
          │
          ▼
Store authoritative user + roles ──▶ authenticated
```

A module-level single-flight restoration promise prevents React Strict Mode's development remount from consuming the same rotating refresh token twice. Definitive token or storage failures clear local authentication material and settle unauthenticated. Transient network or server failures also settle the UI out of `checking` while retaining a normalized error for retry messaging.

## Authenticated Requests and Refresh

The Axios client attaches `Authorization: Bearer <access_token>` only to trusted backend API requests. It does not attach credentials to another origin, outside the configured API path, or when a caller supplied an explicit Authorization header.

On an eligible `401 Unauthorized`, one shared refresh promise rotates the refresh token once for all concurrent failed requests. Each original request is retried at most once with the new access token. Login, logout, token-refresh, and token-verify requests are excluded from automatic refresh, as are explicitly authorized requests and requests marked to skip authentication. A refresh failure clears tokens and signals the `AuthProvider` through a framework-neutral session-invalidation bridge.

The frontend cannot remove ambiguity if the server rotates a refresh token but the corresponding response is lost. In that case, retrying the old token correctly fails because it has already been blacklisted.

## Login, Navigation, Guards, and Logout

Login submits only `email` and `password`. After the backend returns tokens, the frontend stores them according to the policy above and calls `/api/auth/me/`; the smaller nested `user` object in the login response is not treated as authoritative. Safe same-origin return paths are preserved, while external or malformed destinations fall back to the application root.

Protected routes wait while authentication is `checking`, redirect unauthenticated users to login, and preserve an approved return path. The role-aware guard uses independent any-role matching and shows a controlled unauthorized state when the authenticated user lacks a required role. These guards improve navigation and user experience only; every permission decision remains backend-enforced.

Logout sends both the current access token and stored refresh token. The `AuthProvider` transitions its user state to unauthenticated immediately; the API layer clears both tokens in guaranteed cleanup after the backend attempt settles, whether that attempt succeeds or fails. A successful logout blacklists the submitted refresh token, but the access token remains valid until its configured 15-minute expiry.

## Development CORS

The development backend explicitly permits `http://localhost:5173` for `/api/` requests. Credentials are disabled, wildcard origins are not allowed, and the base/production settings default to an empty origin allowlist. This supports the separate Vite origin without introducing cookies or weakening the production default.

---

# Security Principles

The authentication system follows these security practices:

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
* Refresh-token rotation with database-backed outstanding and blacklist state
* Memory-only access-token storage in the React application
* Explicit-origin, credential-free CORS for the development frontend
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


The implemented application roles are Author, Editor, and Administrator. Feature 15 provides safe Administrator-only user provisioning, account-state management, and application-role replacement APIs.

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
* `Administrator` manages users and application roles and does not inherit Editor access.

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
* ✅ Feature 16 — Performance Optimization

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
New Access Token + Rotated Refresh Token
Submitted Refresh Token Blacklisted
    │
    ▼
Logout
    │
    ▼
Refresh Token Blacklisted
```
Access tokens have a 15-minute lifetime and refresh tokens have a 7-day lifetime. Refresh rotation and blacklist-after-rotation are enabled. Outstanding and blacklisted refresh-token records are database-backed through Simple JWT's blacklist application; token refresh and logout are therefore stateful lifecycle operations. Profile APIs reuse this JWT foundation. Feature 11 did not introduce new token types or modify these workflows.

## Pagination and Authorization Flow

Feature 16 adds pagination after authentication, permission evaluation, and queryset scoping:

```text
Request
    ↓
JWT authentication when required
    ↓
Role and object permissions
    ↓
Published, active, ownership, soft-delete, and parent-resource scoping
    ↓
Pagination count and page retrieval
    ↓
Serialized response
```

Pagination does not broaden visibility or replace backend security controls. Post, Post Comment, Category, and Tag lists use standard `20/100` pagination. Post search retains specialized `10/50` pagination, and Administrator User listing retains Administrator-only specialized `20/100` pagination.

Create, retrieve, update, delete, workflow, featured-image, and Profile detail responses remain unpaginated.

## Current Frontend Milestone

Frontend Feature 02 now supplies the React authentication and session architecture for this backend contract. The earlier backend roadmap identified Deployment & CI/CD as Feature 17; that remains a future backend milestone rather than the current authentication task.

---

# Pre-QA Editorial Authorization and Credential-Change Flow

## Editor Comment Moderation

```text
DELETE /api/editorial/comments/{id}/
→ JWT identity
→ IsEditor
→ editorial Comment lookup including deleted records
→ Comment.delete(user=request.user)
→ 204 No Content
```

Anonymous requests receive `401`; Author-only and Administrator-only users receive `403`; unknown IDs receive `404`. Repeated deletion is idempotent `204`. The public `DELETE /api/comments/{id}/` flow remains owner-only.

## Post Management Detail

```text
GET /api/editorial/posts/{slug}/
→ JWT identity
→ IsAuthor OR IsEditor
→ role-scoped active Post queryset
→ PostDetailSerializer
→ 200 OK without persistence mutation
```

Authors retrieve only their own active draft/published Posts. Editors retrieve any active draft/published Post. Administrator-only users receive `403`, and soft-deleted Posts are hidden behind `404`; Editor restoration remains a separate action.

## Password Change and Reset Consistency

Password change and password-reset confirmation invoke an atomic account-security service. The password write and all refresh-token blacklist writes processed by the transaction commit together. A revocation failure raises `SessionRevocationError`, rolls back the transaction, is logged with safe operation/User context, and is mapped by the DRF view to:

```http
503 Service Unavailable
```

```json
{
  "detail": "Unable to complete the security update. Please try again."
}
```

The frontend logs out only after successful password change. A `503` is normalized to a controlled error and does not trigger logout because the credential update rolled back.

Refresh revocation does not invalidate already-issued access tokens. Their configured lifetime is 15 minutes, during which they remain usable until natural expiry. Refresh tokens have a seven-day lifetime, rotation and blacklist-after-rotation remain enabled, and no JWT lifetime changed in this workstream.

A narrow concurrent refresh-token issuance race remains outside this transactional guarantee. Immediate access-token invalidation or removal of that race requires a broader session-version or denylist design and was not introduced.

## Manual Credential-Flow Qualification — 2026-08-10

The live frontend/backend flow verified successful password change, logout after success, rejection of the old credentials, acceptance of the new credentials, and safe rejection of invalid-current-password and confirmation-mismatch requests. Authentication restoration, session, and navigation smoke scenarios also passed. The overall manual result is **PASS WITH NON-BLOCKING ENVIRONMENT LIMITATION**.

Manual password-reset email delivery remains unverified. The local `POST /api/auth/password/reset/` attempt returned `500 Internal Server Error` because no SMTP service was available at `127.0.0.1:25` (`ConnectionRefusedError`, WinError 10061). Automated password-reset, token, rollback, and refresh-revocation tests remain green. This evidence identifies a local infrastructure limitation, not an application defect; production requires real email-provider configuration and end-to-end delivery verification.
