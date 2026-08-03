# ADR-019 — User Administration and Role Management Architecture

## Status

* **Status:** Accepted
* **Date:** 2026-08-03
* **Feature:** Feature 15 — User Administration and Role Management

---

# Context

The Blog Platform is a role-based Content Management System designed for a controlled editorial team.

The application currently defines three independent application roles:

* Author
* Editor
* Administrator

Roles are represented using Django Groups.

Users may belong to multiple roles, and the roles do not automatically inherit permissions from one another. In particular, membership in the Administrator role does not automatically grant Editor permissions.

Before Feature 15, the authentication API supported public user registration through:

```text
POST /api/auth/register/
```

Any unauthenticated visitor could create an active account. Although newly registered users did not automatically receive application roles, public registration was inconsistent with the platform's controlled CMS business model.

The application requires a secure administration workflow for:

* Creating users
* Listing users
* Retrieving user details
* Activating users
* Deactivating users
* Assigning application roles
* Removing application roles

The design must prevent privilege escalation, accidental Administrator lockout, arbitrary Django Group assignment, and partial database updates.

---

# Decision

Feature 15 introduces an Administrator-only user management API.

Public self-registration is removed.

Only authenticated users who belong to the `Administrator` application Group may create and manage user accounts through the REST API.

The administration endpoints are:

```text
POST   /api/admin/users/
GET    /api/admin/users/
GET    /api/admin/users/{id}/
POST   /api/admin/users/{id}/activate/
POST   /api/admin/users/{id}/deactivate/
PUT    /api/admin/users/{id}/roles/
```

General user update and delete endpoints are intentionally not exposed.

---

# Closed Registration Model

The Blog Platform uses a closed-registration model.

Users cannot register themselves through the public API.

The account lifecycle is:

```text
Administrator creates user
        ↓
Administrator assigns application roles
        ↓
User authenticates through the login API
        ↓
Administrator may later change roles or account status
```

Public visitors may access publicly available content but cannot create application accounts.

This model was selected because the system represents a controlled editorial organization rather than an open social platform.

---

# Administrator-Only User Creation

User creation belongs to the administration API rather than the authentication API.

The creation endpoint is:

```text
POST /api/admin/users/
```

The API may accept:

* Username
* Email
* First name
* Last name
* Password
* Password confirmation
* Application roles

The API must not accept:

* `is_staff`
* `is_superuser`
* Direct permissions
* Arbitrary Django Groups
* Password hashes
* Account ownership fields

Users are created through Django's `create_user()` manager method so passwords are processed by Django's configured password hasher.

User creation and initial role assignment occur in one database transaction.

If role assignment fails, the user creation must also be rolled back.

---

# Temporary Password Decision

Feature 15 allows an Administrator to provide the initial user password.

This is an interim onboarding approach because secure email invitation and password-setup functionality are not yet implemented.

The application must:

* Validate password strength using Django password validators
* Never return the submitted password
* Never store the password in plain text
* Never log the password
* Hash the password through `create_user()`

A future invitation feature should replace this workflow with:

```text
Administrator creates account
        ↓
System sends a time-limited password-setup link
        ↓
User chooses their own password
```

The invitation workflow is outside the scope of Feature 15.

---

# Application Roles

Application roles continue to use Django Groups.

The allowed application roles are defined centrally through:

```python
APPLICATION_GROUPS = (
    "Author",
    "Editor",
    "Administrator",
)
```

The REST API accepts role names instead of database primary keys.

Example:

```json
{
  "roles": [
    "Author",
    "Editor"
  ]
}
```

Role names were selected because they are stable application identifiers and remain understandable across development, testing, and production environments.

Database Group IDs are not used in the API because they may differ between environments.

---

# Role Replacement Semantics

The endpoint:

```text
PUT /api/admin/users/{id}/roles/
```

replaces the user's complete collection of application-managed roles.

`PUT` was selected because the submitted role collection represents the desired complete state.

Example:

```json
{
  "roles": [
    "Editor"
  ]
}
```

After the operation, the user has the `Editor` application role and no other application-managed role.

An empty collection is valid:

```json
{
  "roles": []
}
```

A normal user may exist without any application role.

---

# Preservation of Unrelated Django Groups

Feature 15 manages only Groups listed in `APPLICATION_GROUPS`.

The implementation must not use unrestricted Group replacement such as:

```python
user.groups.set(requested_groups)
```

That operation would remove unrelated Django Group memberships.

Instead, the service:

1. Removes only existing application-managed Groups.
2. Adds the requested application-managed Groups.
3. Preserves all unrelated Django Groups.

Example:

```text
Before:
    Author
    Billing Team

Requested application roles:
    Editor

After:
    Editor
    Billing Team
```

This keeps Feature 15 scoped to application roles and avoids destructive changes to Groups owned by other domains or future integrations.

---

# Service Layer

User lifecycle business rules are implemented in a dedicated service:

```text
UserAdministrationService
```

The service owns:

* User creation
* Activation
* Deactivation
* Application-role replacement
* Transaction management
* Self-protection rules
* Last-active-Administrator protection
* Application-role configuration validation
* Row locking

Serializers remain responsible for request validation and API representation.

Views remain responsible for HTTP orchestration.

This separation keeps business logic reusable from:

* REST APIs
* Django Admin integrations
* Management commands
* Tests
* Future background tasks

The service does not depend directly on Django REST Framework exceptions.

---

# View Architecture

The API uses:

```text
UserAdministrationViewSet
```

The ViewSet is composed from:

* `CreateModelMixin`
* `ListModelMixin`
* `RetrieveModelMixin`
* `GenericViewSet`

A full `ModelViewSet` is not used.

This prevents automatic exposure of:

* General update
* Partial update
* User deletion

Mutating operations use explicit actions:

```text
activate
deactivate
roles
```

This makes each operation's purpose and authorization boundary clear.

---

# Serializer Architecture

Feature 15 uses action-specific serializers:

```text
AdminUserCreateSerializer
AdminUserListSerializer
AdminUserDetailSerializer
UserRoleUpdateSerializer
UserActivationSerializer
UserDeactivationSerializer
```

The serializers validate:

* Required fields
* Email uniqueness
* Password confirmation
* Password strength
* Role allowlisting
* Duplicate roles
* Empty action request bodies

The service layer validates business invariants that depend on current database state.

---

# Authorization

Every administration endpoint is protected by:

```text
IsAdministrator
```

Access requires:

1. Successful authentication
2. Membership in the `Administrator` application Group

The following do not automatically grant access:

* Author membership
* Editor membership
* `is_staff`
* Administrator-like Group names
* Django superuser status through the application permission class alone

Application roles remain independent.

Frontend restrictions are not considered security controls. All authorization is enforced by the backend.

---

# Self-Protection Rules

An Administrator cannot deactivate their own account through the administration API.

An Administrator also cannot remove their own `Administrator` role.

These rules reduce the risk of accidental session lockout and preserve a clear administrative recovery path.

The restrictions apply even when another active Administrator exists.

---

# Last Active Administrator Protection

The system must preserve the following invariant:

```text
At least one active user belongs to the Administrator Group.
```

An inactive Administrator does not satisfy this invariant because inactive users cannot authenticate through the normal authentication backend.

The service rejects:

* Deactivating the final active Administrator
* Removing the Administrator role from the final active Administrator

This protection applies independently of self-protection rules.

---

# Transaction and Concurrency Strategy

Mutating user-administration operations use:

```python
transaction.atomic()
```

The service locks:

* The target User row
* The Administrator Group row when Administrator continuity may change
* Relevant application Group rows during role operations

Locking the Administrator Group provides a common serialization point for concurrent operations that could reduce Administrator access.

Without this lock, two simultaneous requests could both observe another active Administrator and remove both Administrators.

All Administrator-role mutations should go through the service layer.

Direct changes through Django Admin, Django shell, raw SQL, or unrelated code paths may bypass these safeguards and must therefore be restricted operationally.

---

# Activation and Deactivation

Activation and deactivation use explicit action endpoints:

```text
POST /api/admin/users/{id}/activate/
POST /api/admin/users/{id}/deactivate/
```

The actions are idempotent.

```text
Activating an active user       → success
Deactivating an inactive user   → success
```

The endpoints do not accept direct `is_active` values.

Clients invoke the approved business operation rather than assigning the model field.

---

# User Deletion

Feature 15 does not expose user deletion.

Deleting users can affect:

* Post authorship
* Comment authorship
* Audit trails
* Ownership relationships
* Historical accountability
* Foreign-key constraints

Deactivation is used to revoke access while preserving historical data.

A separate architectural decision is required before permanent user deletion is introduced.

---

# Query and Pagination Strategy

User listing uses page-number pagination.

The default page size is limited, and the API enforces a maximum page size.

User querysets prefetch Group memberships:

```python
prefetch_related("groups")
```

This prevents an N+1 query problem when serializing user roles.

Results use deterministic ordering:

```text
-date_joined
-pk
```

The primary key acts as a stable tie-breaker when multiple users have the same joining timestamp.

---

# Security Considerations

Feature 15 protects against:

* Public account creation
* Anonymous user enumeration
* Non-Administrator access
* Insecure direct object access
* Arbitrary Group assignment
* Privilege escalation
* Mass assignment
* Plain-text password storage
* Partial user creation
* Self-deactivation
* Self-removal of Administrator access
* Removal of the final active Administrator
* Accidental deletion of unrelated Group memberships
* Exposure of password hashes and direct permissions

Sensitive internal fields are not included in API responses.

---

# JWT Deactivation Consideration

Deactivation prevents future authentication through Django's normal authentication backend.

The behavior of access tokens issued before deactivation must be verified against the configured Simple JWT version and settings.

If existing access tokens remain usable until expiration, possible future controls include:

* Short access-token lifetimes
* Refresh-token blacklisting
* Custom active-user validation
* Token versioning
* Central token revocation

Feature 15 records the observed behavior during testing but does not introduce a new token-revocation architecture.

---

# Database Impact

Feature 15 introduces no new database models.

It reuses:

* The custom User model
* The User `is_active` field
* Django Group
* The User-to-Group many-to-many relationship

No schema migration is required.

Application role Groups must exist as environment configuration data.

---

# Alternatives Considered

## Public Self-Registration

Public self-registration was rejected because the platform is a controlled CMS.

Disadvantages include:

* Spam accounts
* Unnecessary account records
* Email and username reservation abuse
* Larger authentication attack surface
* Additional account review work
* Business-domain inconsistency

---

## Administrator-Protected Registration Endpoint

Keeping:

```text
POST /api/auth/register/
```

and changing its permission to Administrator-only was rejected.

The authentication namespace should represent authentication and token lifecycle operations. User provisioning belongs to the administration domain.

---

## Full `ModelViewSet`

A full `ModelViewSet` was rejected because it would expose general update and delete behavior that the feature does not require.

---

## Direct Serializer Database Updates

Updating users and Groups directly inside serializers was rejected because transactional business rules, concurrency controls, and Administrator continuity checks belong in a reusable service layer.

---

## Complete Group Replacement

Using `user.groups.set()` was rejected because it could remove unrelated Django Groups.

---

## Database Group IDs in Requests

Using Group primary keys was rejected because IDs are environment-specific and expose implementation details.

---

# Consequences

## Positive Consequences

* Public registration is removed.
* Account provisioning matches the controlled CMS domain.
* User administration has a clear API boundary.
* Role assignment is centrally allowlisted.
* Business rules are reusable and testable.
* Unrelated Groups are preserved.
* Administrator lockout risks are reduced.
* User deletion is avoided.
* Query performance remains predictable.
* No schema migration is required.

## Negative Consequences

* Administrators must create every user.
* User onboarding requires administrative effort.
* The Administrator initially knows the temporary password.
* Direct Group changes outside the service can bypass safeguards.
* Additional service and serializer classes increase implementation size.
* Secure invitation-based onboarding remains future work.

---

# Production Considerations

Before production deployment:

* Replace Administrator-selected passwords with secure invitation links.
* Restrict direct Group editing in Django Admin.
* Verify access-token behavior after account deactivation.
* Add automated permission and concurrency tests.
* Log administrative user-management actions.
* Consider audit records for role and status changes.
* Add email notification for newly created accounts.
* Define an account recovery procedure for Administrator access.
* Ensure application Groups are created consistently during deployment.

---

# Decision Outcome

Feature 15 adopts a closed-registration, Administrator-controlled user lifecycle.

The administration API owns user creation, account status changes, and application-role management.

The implementation uses explicit endpoints, action-specific serializers, a transactional service layer, centralized application-role constants, backend authorization, and Administrator continuity safeguards.

This decision establishes a secure and maintainable foundation for future account invitation, audit logging, and organization-management features.
