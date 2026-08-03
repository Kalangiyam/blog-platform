# Feature 15 — User Administration and Role Management

## Feature Summary

Feature 15 introduces Administrator-controlled user lifecycle and application-role management for the Production-Grade Blog Platform.

The feature changes the platform from public self-registration to a closed-registration Content Management System.

Users can no longer register themselves through the public authentication API.

Only authenticated users who belong to the `Administrator` application role can:

* Create users
* List users
* Retrieve user details
* Activate users
* Deactivate users
* Assign application roles
* Remove application roles

The feature intentionally does not expose:

* Public user registration
* General user updates
* User deletion
* Password changes
* Password reset
* Django staff management
* Django superuser management
* Direct permission management
* Arbitrary Django Group management

---

# Business Purpose

The Blog Platform is a controlled editorial CMS rather than an open social platform.

Application accounts represent trusted members of the editorial or administrative team.

Allowing unrestricted public registration would introduce:

* Spam accounts
* Unnecessary database records
* Username reservation abuse
* Email reservation abuse
* Increased authentication attack surface
* Additional account-review work
* Potential future privilege-assignment mistakes

Feature 15 introduces a controlled account-provisioning workflow:

```text
Administrator creates user
        ↓
Administrator assigns application roles
        ↓
User logs in
        ↓
User performs only authorized operations
        ↓
Administrator may later change roles or account status
```

Anonymous users can continue reading publicly available content but cannot create application accounts.

---

# Architecture Summary

Feature 15 follows a layered architecture:

```text
HTTP Request
        ↓
JWT Authentication
        ↓
IsAdministrator Permission
        ↓
UserAdministrationViewSet
        ↓
Action-Specific Serializer
        ↓
UserAdministrationService
        ↓
Database Transaction
        ↓
User and Group Models
        ↓
Serialized API Response
```

Each layer has a separate responsibility.

## View Layer

The view layer handles:

* HTTP requests
* Permission enforcement
* Object retrieval
* Serializer selection
* HTTP response construction

## Serializer Layer

The serializer layer handles:

* Request-shape validation
* Field validation
* Password confirmation
* Password-strength validation
* Email uniqueness validation
* Role allowlisting
* Duplicate-role validation
* Safe API representation
* Translation of service errors into API errors

## Service Layer

The service layer handles:

* User creation
* Initial role assignment
* Activation
* Deactivation
* Role replacement
* Transaction management
* Concurrency controls
* Self-protection rules
* Last-active-Administrator protection
* Preservation of unrelated Groups

## Permission Layer

The existing centralized permission system provides:

```text
IsAdministrator
```

This permission grants access only when the authenticated user belongs to the `Administrator` Django Group.

Roles remain independent.

Administrator membership does not automatically grant Editor or Author permissions.

---

# API Endpoints

Feature 15 introduces the following endpoints:

```text
POST   /api/admin/users/
GET    /api/admin/users/
GET    /api/admin/users/{id}/
POST   /api/admin/users/{id}/activate/
POST   /api/admin/users/{id}/deactivate/
PUT    /api/admin/users/{id}/roles/
```

The previous endpoint:

```text
POST /api/auth/register/
```

has been removed.

---

# User Creation API

## Endpoint

```http
POST /api/admin/users/
```

## Permission

```text
Administrator only
```

## Example Request

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "Kumar",
  "password": "StrongUserPassword123!",
  "password_confirm": "StrongUserPassword123!",
  "roles": [
    "Author"
  ]
}
```

## Example Response

```json
{
  "id": 8,
  "username": "alice",
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "Kumar",
  "is_active": true,
  "roles": [
    "Author"
  ],
  "date_joined": "2026-08-03T03:00:00Z",
  "last_login": null
}
```

## Creation Rules

The API:

* Requires a unique username
* Requires a unique email
* Checks email uniqueness case-insensitively
* Normalizes the email value
* Requires matching passwords
* Uses Django password validators
* Hashes the password through `create_user()`
* Allows only application-managed roles
* Rejects duplicate roles
* Creates users as active
* Creates the user and roles atomically

The API does not accept:

```text
is_staff
is_superuser
user_permissions
groups
password hash
is_active
```

---

# Authentication Architecture Changes

Before Feature 15, the Users app exposed public registration.

Feature 15 removes `RegisterAPIView` and `RegisterSerializer`.

The authentication API now owns only:

```text
POST /api/auth/login/
GET  /api/auth/me/
POST /api/auth/logout/
POST /api/auth/token/refresh/
POST /api/auth/token/verify/
```

This creates a clear separation:

```text
Authentication domain
    Identity verification
    Login
    Logout
    Current user
    Token lifecycle

Administration domain
    User creation
    User listing
    User activation
    User deactivation
    Role management
```

---

# ViewSet Design

Feature 15 introduces:

```text
UserAdministrationViewSet
```

The ViewSet uses:

```text
CreateModelMixin
ListModelMixin
RetrieveModelMixin
GenericViewSet
```

A full `ModelViewSet` is intentionally not used.

This prevents automatic exposure of:

```text
PUT    /api/admin/users/{id}/
PATCH  /api/admin/users/{id}/
DELETE /api/admin/users/{id}/
```

Instead, every permitted mutation has an explicit business endpoint.

---

# Action-Specific Serializers

Feature 15 introduces:

```text
AdminUserCreateSerializer
AdminUserListSerializer
AdminUserDetailSerializer
UserRoleUpdateSerializer
UserActivationSerializer
UserDeactivationSerializer
```

## AdminUserCreateSerializer

Responsible for:

* Username validation
* Email validation
* Password validation
* Password confirmation
* Role input validation
* Calling the user-administration service
* Returning a safe detail response

## AdminUserListSerializer

Responsible for efficient user-list responses.

It exposes:

* ID
* Username
* Email
* First name
* Last name
* Active status
* Application roles
* Date joined

## AdminUserDetailSerializer

Responsible for detailed Administrator-facing responses.

It additionally exposes:

* Last login

It does not expose:

* Password hash
* Staff status
* Superuser status
* Direct permissions
* Unrelated Groups

## UserRoleUpdateSerializer

Responsible for validating complete replacement of application roles.

## UserActivationSerializer

Responsible for executing the activation operation.

It accepts an empty request body only.

## UserDeactivationSerializer

Responsible for executing the deactivation operation and translating business-rule failures.

It accepts an empty request body only.

---

# Service Layer

Feature 15 introduces:

```text
UserAdministrationService
```

The service provides:

```text
create_user()
activate_user()
deactivate_user()
replace_application_roles()
```

The service is independent of Django REST Framework HTTP exceptions.

This allows the business logic to be reused from:

* REST APIs
* Django Admin
* Management commands
* Automated tests
* Future background jobs

---

# Application Roles

The application roles are:

```text
Author
Editor
Administrator
```

They are centrally defined in:

```text
APPLICATION_GROUPS
```

The API accepts role names instead of database IDs.

Example:

```json
{
  "roles": [
    "Author",
    "Editor"
  ]
}
```

Role names are used because:

* They are understandable
* They are stable application identifiers
* Database IDs differ between environments
* They prevent clients from assigning arbitrary Group records

---

# Role Replacement

## Endpoint

```http
PUT /api/admin/users/{id}/roles/
```

## Example Request

```json
{
  "roles": [
    "Author",
    "Editor"
  ]
}
```

The submitted list represents the complete desired application-role state.

Example:

```text
Current roles:
    Author

Requested roles:
    Editor

Final roles:
    Editor
```

An empty list is allowed:

```json
{
  "roles": []
}
```

A user may exist without an application role.

---

# Preservation of Unrelated Groups

Feature 15 manages only Groups listed in `APPLICATION_GROUPS`.

It does not use:

```python
user.groups.set(requested_groups)
```

That operation would remove unrelated Group memberships.

Instead, the service:

1. Retrieves all application-managed Groups
2. Removes only those application Groups
3. Adds the requested application Groups
4. Preserves every unrelated Group

Example:

```text
Before:
    Author
    Billing Team

Requested:
    Editor

After:
    Editor
    Billing Team
```

This prevents destructive cross-domain changes.

---

# Activation

## Endpoint

```http
POST /api/admin/users/{id}/activate/
```

## Request Body

```json
{}
```

## Behavior

The operation sets:

```text
is_active=True
```

Activation is idempotent.

```text
Inactive user → active
Active user   → remains active
```

Activating an already-active user returns a successful response.

---

# Deactivation

## Endpoint

```http
POST /api/admin/users/{id}/deactivate/
```

## Request Body

```json
{}
```

## Behavior

The operation sets:

```text
is_active=False
```

Deactivation is idempotent.

```text
Active user   → inactive
Inactive user → remains inactive
```

Deactivation preserves the user and all historical relationships.

---

# Why User Deletion Is Not Exposed

Permanent user deletion could affect:

* Post authorship
* Comment authorship
* Profiles
* Audit trails
* Ownership checks
* Historical records
* Foreign-key relationships
* Accountability

Feature 15 uses deactivation as the account-revocation mechanism.

A separate architectural decision is required before permanent user deletion can be added.

---

# Self-Protection Rules

## Self-Deactivation

An Administrator cannot deactivate their own account.

Rejected operation:

```text
Authenticated Administrator
        ↓
POST own /deactivate/ endpoint
        ↓
Rejected
```

This prevents accidental session lockout.

## Self-Removal of Administrator Role

An Administrator cannot remove their own `Administrator` role.

This restriction applies even if another active Administrator exists.

It ensures that an Administrator cannot accidentally remove the permission required to manage the system during their current workflow.

---

# Last Active Administrator Protection

The application preserves the invariant:

```text
At least one active user belongs to the Administrator Group.
```

The service rejects:

* Deactivating the last active Administrator
* Removing the Administrator role from the last active Administrator

Inactive Administrators do not count because inactive accounts cannot normally authenticate.

---

# Transaction Management

All modifying operations use:

```python
transaction.atomic()
```

## User Creation Transaction

```text
BEGIN
    Create user
    Assign application roles
COMMIT
```

If role assignment fails:

```text
ROLLBACK
```

The platform does not leave behind a partially created user.

## Role Replacement Transaction

```text
BEGIN
    Lock relevant records
    Validate Administrator continuity
    Remove old application roles
    Add requested application roles
COMMIT
```

## Deactivation Transaction

```text
BEGIN
    Lock Administrator Group
    Lock target user
    Validate self-protection
    Validate Administrator continuity
    Deactivate user
COMMIT
```

---

# Concurrency Protection

A simple count of active Administrators is not sufficient under concurrent requests.

Example race condition:

```text
Administrator A sees Administrator B
Administrator B sees Administrator A
Both requests pass validation
Both lose Administrator access
```

To prevent this, operations capable of reducing Administrator access lock the Administrator Group row using:

```python
select_for_update()
```

This provides a shared serialization point.

The target User row is also locked.

This strategy is effective when all application role changes go through the service layer.

Direct Group modifications through Django Admin, shell, raw SQL, or unrelated code can bypass these safeguards.

---

# Query Optimization

The administration ViewSet uses:

```python
prefetch_related("groups")
```

Without prefetching, listing users could create an N+1 query pattern:

```text
1 query for users
1 additional query per user for Groups
```

With prefetching:

```text
1 query for users
1 query for Group relationships
```

This keeps list-query performance predictable.

---

# Pagination

User listing uses page-number pagination.

Configuration:

```text
Default page size: 20
Maximum page size: 100
Custom parameter: page_size
```

Example:

```http
GET /api/admin/users/?page_size=50
```

Pagination prevents unnecessarily large responses.

---

# Ordering

Users are ordered by:

```text
-date_joined
-pk
```

The primary key acts as a deterministic tie-breaker when multiple users have the same joining timestamp.

Stable ordering is important for reliable pagination.

---

# Permissions

All Feature 15 endpoints use:

```text
IsAdministrator
```

Expected access:

| User type                   |  Access |
| --------------------------- | ------: |
| Anonymous                   |  Denied |
| Authenticated roleless user |  Denied |
| Author only                 |  Denied |
| Editor only                 |  Denied |
| Administrator               | Allowed |
| Author + Administrator      | Allowed |
| Editor + Administrator      | Allowed |

Roles are independent.

Administrator status does not automatically include Editor or Author behavior.

---

# Security

Feature 15 addresses the following security risks.

## Public Registration Abuse

Public registration has been removed.

## Unauthorized User Enumeration

User listing and retrieval require Administrator membership.

## IDOR

A user cannot access another user's administrative record merely by changing the URL ID.

The endpoint permission is enforced before user data is returned.

## Privilege Escalation

Clients cannot assign:

* Arbitrary Groups
* Staff status
* Superuser status
* Direct Django permissions

## Mass Assignment

Only explicitly declared serializer fields are accepted.

## Weak Passwords

Django password validators are used during creation.

## Plain-Text Password Storage

Users are created using `create_user()`.

## Partial Creation

User creation and role assignment occur in a transaction.

## Administrator Lockout

Self-protection and last-active-Administrator rules are enforced.

## Destructive Group Replacement

Unrelated Django Groups are preserved.

## Sensitive Data Exposure

Responses exclude:

* Password hashes
* Direct permissions
* Staff configuration
* Superuser configuration
* Unrelated Groups

---

# Database Changes

Feature 15 introduces no new models.

It reuses:

```text
User
Group
User.groups
User.is_active
```

No migration is required.

The environment must contain these Group records:

```text
Author
Editor
Administrator
```

---

# Files Created

```text
backend/apps/users/admin_urls.py
backend/apps/users/pagination.py

backend/apps/users/serializers/__init__.py
backend/apps/users/serializers/administration.py
backend/apps/users/serializers/authentication.py

backend/apps/users/services/__init__.py
backend/apps/users/services/exceptions.py
backend/apps/users/services/user_administration.py

backend/apps/users/views/__init__.py
backend/apps/users/views/administration.py
backend/apps/users/views/authentication.py

docs/ADR/ADR-019-User-Administration-and-Role-Management.md
docs/feature/Feature-15-User-Administration-and-Role-Management.md
```

---

# Files Modified

```text
backend/apps/users/urls.py
backend/config/urls.py
docs/Project-Status.md
```

---

# Files Removed

```text
backend/apps/users/serializers.py
backend/apps/users/views.py
```

These modules were replaced by packages to separate authentication and administration responsibilities.

The public registration serializer and view were removed.

---

# Models

No model was created or modified.

Feature 15 reuses the custom User model and Django Group model.

---

# APIs

## Added

```text
POST   /api/admin/users/
GET    /api/admin/users/
GET    /api/admin/users/{id}/
POST   /api/admin/users/{id}/activate/
POST   /api/admin/users/{id}/deactivate/
PUT    /api/admin/users/{id}/roles/
```

## Removed

```text
POST /api/auth/register/
```

## Retained

```text
POST /api/auth/login/
GET  /api/auth/me/
POST /api/auth/logout/
POST /api/auth/token/refresh/
POST /api/auth/token/verify/
```

---

# Manual Testing Coverage

The following scenarios should be manually verified before the feature is marked complete.

## Authentication and Authorization

* Anonymous user cannot access administration APIs
* Roleless user cannot access administration APIs
* Author cannot access administration APIs
* Editor cannot access administration APIs
* Administrator can access administration APIs
* Staff status alone does not grant application access

## User Creation

* Administrator can create a user
* User is active after creation
* User can be created without roles
* User can be created with one role
* User can be created with multiple roles
* Password is hashed
* Weak password is rejected
* Password mismatch is rejected
* Duplicate username is rejected
* Duplicate email is rejected
* Case-insensitive duplicate email is rejected
* Invalid role is rejected
* Duplicate role is rejected
* Sensitive fields cannot be assigned
* Creation rolls back when role configuration fails

## User Listing

* Administrator can list users
* Results are paginated
* Page size can be changed
* Maximum page size is enforced
* Application roles are included
* Unrelated Groups are not exposed
* Ordering is deterministic

## User Detail

* Administrator can retrieve a user
* Missing user returns `404`
* Sensitive fields are excluded
* Application roles are included

## Role Management

* Administrator can replace roles
* Administrator can assign multiple roles
* Administrator can remove all roles
* Invalid roles are rejected
* Duplicate roles are rejected
* Unrelated Groups are preserved
* Response immediately shows updated roles
* Administrator cannot remove their own Administrator role
* Last active Administrator cannot lose the role

## Activation

* Administrator can activate an inactive user
* Activating an active user succeeds
* Unexpected request fields are rejected

## Deactivation

* Administrator can deactivate an active user
* Deactivating an inactive user succeeds
* Inactive user cannot log in
* Unexpected request fields are rejected
* Administrator cannot deactivate themselves
* Last active Administrator cannot be deactivated

## Unsupported Operations

* General `PUT` returns `405`
* General `PATCH` returns `405`
* `DELETE` returns `405`
* Public registration returns `404`

---

# JWT Deactivation Observation

Deactivation prevents future login through the configured authentication backend.

The behavior of an access token issued before deactivation must be manually tested.

If existing access tokens remain valid, this is not necessarily an implementation bug in Feature 15. JWT access tokens are commonly self-contained and may remain valid until expiration unless additional active-user validation or revocation logic is configured.

Potential future improvements include:

* Short access-token lifetime
* Custom active-user validation
* Token versioning
* Central token revocation
* Session or token audit records

---

# Key Concepts Learned

## Closed Registration

A closed-registration system allows only trusted administrators to provision application accounts.

## Identity vs. Authority

Authentication establishes identity.

Role assignment establishes authority.

Creating an account does not automatically grant business permissions.

## Role-Based Access Control

Django Groups represent application roles.

Permissions are assigned according to application responsibility.

## Independent Roles

Author, Editor, and Administrator are independent.

A user may hold one, multiple, or no application roles.

## Service Layer

Complex business rules are separated from serializers and views.

## Transaction Atomicity

Related database writes either all succeed or all fail.

## Pessimistic Locking

`select_for_update()` prevents conflicting concurrent updates.

## Idempotency

Repeating activation or deactivation produces the same final state safely.

## Mass Assignment Protection

Only explicitly allowed serializer fields can affect the model.

## N+1 Query Prevention

`prefetch_related()` loads many-to-many relationships efficiently.

## Object-Level Security

Backend authorization is enforced before user-specific resources are returned or modified.

---

# Common Mistakes

## Keeping Public Registration

Public registration does not match a controlled CMS account model.

## Using `ModelViewSet`

A full `ModelViewSet` may expose unnecessary update and delete operations.

## Using `groups.set()`

This can remove unrelated Django Groups.

## Trusting Frontend Restrictions

Frontend role checks are usability features, not security controls.

## Accepting Group IDs

Database IDs are environment-specific and may expose arbitrary Group records.

## Putting Business Rules in Views

This creates duplication and makes testing difficult.

## Putting Transactions in Serializers Only

Transactional lifecycle rules belong in a dedicated service.

## Counting Administrators Without Locking

Concurrent requests could both pass a count-based check.

## Allowing Self-Deactivation

An Administrator may accidentally lock themselves out.

## Exposing `is_superuser`

Application Administrator status must not automatically control Django superuser privileges.

## Deleting Users Instead of Deactivating Them

Deletion may destroy historical accountability and break relationships.

## Returning Passwords

Passwords must never appear in API responses, logs, or documentation examples based on real credentials.

---

# Interview Questions

## 1. Why was public registration removed?

Because the platform is a controlled editorial CMS. Accounts represent trusted team members and should be provisioned by an Administrator.

## 2. Why does user creation belong under `/api/admin/users/`?

User creation is an administrative provisioning operation, not an authentication operation.

## 3. Why use a service layer?

The feature contains transactional and reusable business rules that should not be tied directly to HTTP or serializer behavior.

## 4. Why not use `ModelViewSet`?

It would expose general update, partial update, and delete operations that are outside the business requirements.

## 5. Why use Django Groups for roles?

Groups provide a built-in many-to-many relationship between users and reusable role identities.

## 6. Why use role names instead of IDs?

Names are stable application identifiers and remain understandable across environments.

## 7. Why not use `user.groups.set()`?

It would remove unrelated Group memberships.

## 8. Why is `transaction.atomic()` required?

User creation and role assignment must either both succeed or both fail.

## 9. Why lock the Administrator Group?

It provides a shared concurrency lock for operations that could reduce active Administrator access.

## 10. What is the last-active-Administrator invariant?

At least one active user must belong to the Administrator Group.

## 11. Why are inactive Administrators not counted?

Inactive users cannot normally authenticate and therefore cannot recover or administer the system.

## 12. Why is activation idempotent?

Repeated requests safely produce the same active state, which helps with retries and network failures.

## 13. Why is deactivation preferred over deletion?

Deactivation revokes access while preserving historical ownership and audit information.

## 14. What is mass assignment?

Mass assignment occurs when untrusted request fields are applied to a model without an explicit allowlist.

## 15. Why use `prefetch_related()` for Groups?

Groups are a many-to-many relationship. Prefetching avoids one additional query per serialized user.

## 16. What is an IDOR risk in this feature?

A user might change a URL ID to access another account. Backend permission enforcement prevents unauthorized access.

## 17. Does Django staff status grant application Administrator access?

No. Application authorization is based on membership in the Administrator Group.

## 18. Why can a user have no role?

Authentication identity and business authorization are separate concerns. A valid account may exist without application permissions.

## 19. What happens to previously issued JWTs after deactivation?

The exact result depends on JWT authentication configuration. This must be tested and documented.

## 20. What should replace Administrator-chosen passwords in production?

A time-limited invitation and password-setup workflow.

---

# Refactoring Opportunities

## Shared Role Serialization

The list and detail serializers use similar role representation logic.

A shared mixin or dedicated role serializer may reduce duplication.

## Exception Translation

Service-to-API exception translation may later move into a centralized exception handler if additional service-layer features use the same pattern.

## Administrative Audit Logging

Future work should record:

* Acting Administrator
* Target user
* Previous state
* New state
* Timestamp
* Operation type

## Invitation-Based Onboarding

Administrator-selected temporary passwords should eventually be replaced by secure invitation links.

## Search and Filtering

Future list enhancements may include:

```text
?search=
?role=
?is_active=
```

These were intentionally excluded from Feature 15 to keep the initial scope focused.

## Role Configuration Management

Application Groups currently need to exist as configuration data.

A deployment-safe data migration or management command may improve environment consistency.

## Automated Testing

Manual testing should be replaced or supplemented by:

* Serializer tests
* Service tests
* API permission tests
* Transaction rollback tests
* Group preservation tests
* Concurrency tests

## Token Revocation

If existing JWT access tokens remain valid after deactivation, a stronger revocation architecture may be introduced later.

---

# Documentation Updates

## New Documents

```text
docs/ADR/ADR-019-User-Administration-and-Role-Management.md
docs/feature/Feature-15-User-Administration-and-Role-Management.md
```

## Updated Documents

```text
docs/Project-Status.md
```

## Unchanged Documents

```text
README.md
docs/API-Specification.md
docs/Architecture.md
docs/Authentication-Flow.md
docs/Database-Design.md
docs/Testing-Strategy.md
```

These documents remain unchanged under the current reduced documentation workflow.

The API Specification should receive a full synchronization update when the backend API documentation milestone begins.

---

# Feature Completion Status

```text
Feature 15 — User Administration and Role Management
Status: Completed, subject to final manual-test verification
```

---

# Final Outcome

Feature 15 establishes a secure Administrator-controlled account-management system.

The platform now uses:

* Closed registration
* Administrator-only user provisioning
* Centralized role allowlisting
* Explicit lifecycle endpoints
* Transactional business logic
* Concurrency-aware Administrator safeguards
* Backend-enforced permissions
* Non-destructive Group management
* Paginated and optimized user queries

This provides a production-oriented foundation for future invitation onboarding, audit logging, organization management, and frontend administration features.
