# Feature 14 — Permissions & Authorization

## Feature Summary

Feature 14 introduces a centralized role-based authorization architecture for the Production-Grade Blog Platform.

The feature replaces scattered and overly broad authorization rules with explicit application roles implemented through Django Groups and reusable Django REST Framework permission classes.

The final application roles are:

- `Author`
- `Editor`
- `Administrator`

The roles are independent rather than hierarchical.

A user may belong to multiple roles when their responsibilities require more than one capability set.

The feature also strengthens authorization through:

- Role-based permission classes
- Permission composition
- Object-level permissions
- Queryset scoping
- Backend-only enforcement
- Least-privilege access
- IDOR protection
- Separation of Django staff access from application roles

---

# Business Problem

Before Feature 14, the application used several authorization mechanisms across different domains:

- `AllowAny`
- `IsAuthenticated`
- Django `is_staff`
- Domain-specific ownership permissions
- Action-specific permission selection
- Queryset filtering

This was acceptable during the early development stages, but it introduced several problems as the project grew.

The main business and engineering risks were:

- Django staff status was being treated as an application business role.
- Authorization rules were distributed across multiple applications.
- Similar permission logic could be duplicated.
- The application had no formal role model.
- Authors and Editors could not be represented separately.
- Administrators could accidentally receive editorial privileges.
- Ownership checks and role checks were not clearly separated.
- Incorrect queryset handling could expose private resources.
- Future user-administration features required a secure role foundation.

Feature 14 solves these problems by introducing explicit, independent, reusable application roles.

---

# Real-World Usage

The authorization system supports realistic publishing-platform responsibilities.

## Author Workflow

An Author can:

- Create a draft post
- Update their own post
- Delete their own post through soft deletion
- Publish or unpublish their own post
- Upload or replace their own featured image
- Remove their own featured image
- Create comments
- Manage their own comments

An Author cannot manage content owned by another user.

## Editor Workflow

An Editor can:

- Create posts
- Review posts from any Author
- Update any active post
- Publish or unpublish any active post
- Manage featured images for any active post
- Create and update categories
- Create and update tags
- Perform future moderation operations

The Editor does not need Django Admin access.

## Administrator Workflow

An Administrator is reserved for application administration.

An Administrator may later:

- List users
- View user details
- Activate or deactivate accounts
- Assign approved application roles
- Remove approved application roles

An Administrator does not automatically receive editorial permissions.

When one user requires both responsibilities, the user may belong to:

```text
Editor + Administrator
```
## Architecture Summary

Feature 14 uses several authorization layers.

```text
Client Request
      │
      ▼
JWT Authentication
      │
      ▼
request.user
      │
      ▼
View-Level Role Permission
      │
      ▼
Scoped Queryset
      │
      ▼
Object-Level Permission
      │
      ▼
Serializer Validation
      │
      ▼
Business Operation
      │
      ▼
Database
```

Each layer has a separate responsibility.

### Authentication

Authentication answers:
> Who is making the request?

JWT authentication populates:
`request.user`

---

### Role Permission

Role permissions answer:
> May this type of user perform this category of operation?

Examples include:
* Author or Editor may create Posts.
* Only Editor may modify Categories.
* Only Editor may modify Tags.

---

### Queryset Scoping

Queryset scoping answers:
> Which objects may this user locate through this endpoint?

Examples include:
* Authors receive only their own Posts for management actions.
* Editors receive all active Posts for management actions.
* Public users receive only published Posts.

---

### Object-Level Permission

Object-level permission answers:
> May this user perform the operation on this specific object?

Examples include:
* Author may modify an owned Post.
* Author may not modify another user's Post.
* Editor may modify any accessible active Post.

---

### Serializer and Service Validation

Serializer and service validation enforce business rules that are not simple access checks.

Examples include:
* Publishing-state validation
* Featured-image validation
* Category assignment validation
* Tag assignment validation
* Backend-controlled ownership

---

## Role Model

The application uses the following independent roles:

* Author
* Editor
* Administrator

The roles do not automatically inherit one another. This means:
* Administrator $\neq$ Editor
* Editor $\neq$ Author

A user may hold multiple roles. For example:
* Author + Editor
* Editor + Administrator

This approach follows least privilege because every responsibility must be assigned explicitly.

---

## Django Group Integration

Django Groups are used as the persistence mechanism for application roles. The role names are defined through constants. Example:

```python
AUTHOR_GROUP = "Author"
EDITOR_GROUP = "Editor"
ADMINISTRATOR_GROUP = "Administrator"
```
The application groups are created through a Django data migration. The migration uses:

`apps.get_model("auth", "Group")`

instead of importing the runtime Group model directly. It also uses:

`get_or_create()`

to ensure the migration is repeatable and does not create duplicate groups.

Role strings are duplicated inside the migration intentionally because migrations must remain historically stable and must not depend on future runtime-code changes.

---

## Database Changes

Feature 14 does not add a new application model. It uses Django's existing authentication tables, including the tables that support:
* Users
* Groups
* User-to-Group membership

The feature adds application role records through a data migration:
* Author
* Editor
* Administrator

No role field was added directly to the custom User model.

---

## Models

No new domain model was introduced. The existing custom User model continues to inherit from:

`AbstractUser`

This already provides integration with:
* Django Groups
* Django permissions
* `is_staff`
* `is_superuser`

Application roles are stored through the existing User-to-Group many-to-many relationship.

---

## Role Constants

Role names are centralized in the Users domain. Conceptually:

```python
AUTHOR_GROUP = "Author"
EDITOR_GROUP = "Editor"
ADMINISTRATOR_GROUP = "Administrator"

APPLICATION_GROUPS = (
    AUTHOR_GROUP,
    EDITOR_GROUP,
    ADMINISTRATOR_GROUP,
)
```
Centralized constants reduce:
* Typographical errors
* Inconsistent capitalization
* Repeated string literals
* Role-name drift across applications

Runtime code should use these constants instead of directly repeating group-name strings.

---

## Shared Permission Package

Reusable permission classes are stored in:

`backend/apps/core/permissions/`

The package separates permission responsibilities into focused modules. The implemented permission architecture includes:
* Base role membership logic
* Author permission
* Editor permission
* Administrator permission
* Editor-or-read-only policy
* Permission package exports

The shared package allows multiple applications to reuse the same business role definitions without duplicating authorization logic.

---

## Permission Classes

### `IsInGroup`
`IsInGroup` provides the reusable foundation for Django Group membership checks. Conceptually:
```python
request.user.groups.filter(
    name=required_group,
).exists()
```
The base class should deny access when:
* The request has no authenticated user.
* The required group is not configured.
* The user does not belong to the required group.

This creates fail-closed behavior.

---

## Permission Classes (Continued)

### `IsAuthor`
`IsAuthor` grants access only to authenticated users in the Author group. It answers:
> Does the current user hold the Author role?

It does not perform object ownership checks. Ownership remains a separate responsibility.

---

### `IsEditor`
`IsEditor` grants access only to authenticated users in the Editor group. It is used for operations such as:
* Managing all active Posts
* Managing Categories
* Managing Tags
* Future editorial moderation

It does not rely on:
`user.is_staff`

---

### `IsAdministrator`
`IsAdministrator` grants access only to authenticated users in the Administrator group. During Feature 14, the permission establishes the foundation for future user-administration APIs.

It does not automatically grant:
* Post management
* Category management
* Tag management
* Editorial moderation

---

### `IsEditorOrReadOnly`
`IsEditorOrReadOnly` supports public taxonomy reads with Editor-only writes. The rule is:
* **Safe request method** $\rightarrow$ Allow
* **Unsafe request method** $\rightarrow$ Require authenticated Editor

Safe methods include:
* `GET`
* `HEAD`
* `OPTIONS`

Unsafe methods include:
* `POST`
* `PUT`
* `PATCH`
* `DELETE`

This permission replaced `is_staff`-based API authorization for Categories and Tags.

---

## Permission Composition

Django REST Framework supports permission composition through operators such as:

`IsAuthor | IsEditor`

This represents: **Author OR Editor**

When permission classes appear together in a collection, they are combined with logical AND. For example:

```python
(
    IsAuthenticated,
    IsAuthor | IsEditor,
    IsPostAuthor,
)
```
represents:
> Authenticated **AND** (Author OR Editor) **AND** Post object permission

This makes complex authorization policies explicit and readable.

---

## Posts Authorization

Post authorization is action-specific.

### Public Actions
Public Post actions remain accessible without authentication. These include:
* List published Posts
* Retrieve a published Post
* Search published Posts

Public querysets must include only:
* Published Posts
* Non-deleted Posts

### Create Action
Post creation requires:
> **Authenticated AND (Author OR Editor)**

Administrators without Author or Editor roles cannot create Posts.

### Management Actions
Post-management actions require:
> **Authenticated AND (Author OR Editor) AND Post object permission**

Management actions include:
* Update
* Partial update
* Soft delete
* Publish
* Unpublish
* Upload featured image
* Replace featured image
* Remove featured image

---

## Post Object-Level Permission

The Post object permission supports both ownership and editorial access. The rule is:
* **Editor** $\rightarrow$ Allow access to any accessible active Post
* **Author** $\rightarrow$ Allow access only when `obj.author == request.user`

This preserves ownership restrictions for Authors while allowing Editors to perform editorial work.

Role permission and object-level permission remain separate. This prevents accidental coupling between:
* Role membership
* Resource ownership

---

## Post Queryset Scoping

Post querysets are scoped based on the action and user role.

### Public Queryset
Public actions use the published Post manager. Conceptually:

```python
Post.objects.published()
```
This excludes:
* Draft Posts
* Unpublished Posts
* Soft-deleted Posts

### Author Management Queryset
For management actions, Authors receive only their own active Posts. Conceptually:
```python
Post.objects.filter(author=request.user)
```
This means changing the URL slug to another user's Post does not expose the object. The usual response is:

> `404 Not Found`

### Editor Management Queryset
Editors receive all active, non-deleted Posts for management actions. This allows editorial workflows without exposing deleted records.

### Administrator Queryset
Administrator-only users fail the role-permission stage for editorial actions. They are not granted a Post-management queryset.

---

## Categories Authorization

Category reads remain public. Examples:
* `GET /api/categories/`
* `GET /api/categories/{slug}/`

Category write operations require Editor role. Examples:
* `POST /api/categories/`
* `PATCH /api/categories/{slug}/`

### Expected behavior:
* **Anonymous read** $\rightarrow$ Allowed
* **Author write** $\rightarrow$ Denied
* **Editor write** $\rightarrow$ Allowed
* **Administrator-only write** $\rightarrow$ Denied
* **Staff-only user without Editor role** $\rightarrow$ Denied

---

## Tags Authorization

Tag reads remain public. Examples:
* `GET /api/tags/`
* `GET /api/tags/{slug}/`

Tag write operations require Editor role. Examples:
* `POST /api/tags/`
* `PATCH /api/tags/{slug}/`

### Expected behavior:
* **Anonymous read** $\rightarrow$ Allowed
* **Author write** $\rightarrow$ Denied
* **Editor write** $\rightarrow$ Allowed
* **Administrator-only write** $\rightarrow$ Denied
* **Staff-only user without Editor role** $\rightarrow$ Denied

---

## Django Staff Separation

Before Feature 14, taxonomy write access relied on:

`user.is_staff`

Feature 14 replaces this with application role checks. This is important because `is_staff` controls access to Django's administrative functionality and should not represent an application Editor. The final separation is:

* **`is_staff`** $\rightarrow$ Django Admin access
* **Editor group** $\rightarrow$ Blog editorial API access
* **Administrator group** $\rightarrow$ Future application user administration

A user may be:
* Editor without Django Admin access
* Django staff without Editor access
* Administrator without editorial access
* Editor and Administrator simultaneously

---

## Request Flow

### Author Updating an Owned Post
```text
PATCH request
    ↓
JWT authentication succeeds
    ↓
User holds Author role
    ↓
Author-scoped queryset contains owned Post
    ↓
Post object ownership check succeeds
    ↓
Serializer validates request
    ↓
Post is updated
    ↓
Response returned
```

Author Updating Another User's Post
```text
PATCH request
    ↓
JWT authentication succeeds
    ↓
User holds Author role
    ↓
Author-scoped queryset excludes target Post
    ↓
Object cannot be located
    ↓
404 response
```
Editor Updating Any Active Post

```text
PATCH request
    ↓
JWT authentication succeeds
    ↓
User holds Editor role
    ↓
Editor queryset contains target active Post
    ↓
Object permission recognizes Editor
    ↓
Serializer validates request
    ↓
Post is updated
```
Administrator Updating a Post

```text
PATCH request
    ↓
JWT authentication succeeds
    ↓
User does not hold Author or Editor role
    ↓
Role permission fails
    ↓
403 response
```
## Response Flow

### Successful protected request:
```text
Permission checks succeed
    ↓
Object is retrieved from scoped queryset
    ↓
Serializer performs validation
    ↓
Database operation succeeds
    ↓
Response serializer renders safe fields
    ↓
HTTP response returned
```
Denied request:
```text
Authentication or permission check fails
    ↓
Business operation is not executed
    ↓
Database is not modified
    ↓
401, 403, or 404 response returned
```
The exact status depends on whether the failure is caused by:
* Missing authentication
* Failed role authorization
* Object absence from scoped queryset
* Object-level denial

---

## Data Flow

Role information flows through Django's User-to-Group relationship.
```text
User
  │
  ▼
User Group Membership
  │
  ▼
Application Group
  │
  ▼
DRF Permission Class
  │
  ▼
Allow or Deny Request
```
Resource ownership remains in the relevant domain model. For Posts:
```text
User
  │
  ▼
Post.author
  │
  ▼
IsPostAuthor
```
This avoids storing role and ownership information in the same place.

---

## Frontend and Backend Interaction

The frontend may use role information to improve the user experience. Examples:
* Hide Category management controls from Authors.
* Display editorial tools to Editors.
* Display future user-management navigation to Administrators.
* Hide Post-edit controls when the user lacks permission.

However, frontend restrictions are not security controls. A malicious user may manually send HTTP requests outside the frontend. Therefore, every protected operation is enforced again on the backend through:
* JWT authentication
* Role permissions
* Queryset scoping
* Object-level permissions
* Serializer validation

---

## Security

### Authentication
Protected operations require a valid authenticated user. JWT authentication remains responsible for establishing user identity.

### Authorization
Application roles are checked through backend permission classes. The client cannot grant itself a role by changing request data.

### Ownership Enforcement
Authors may manage only owned resources. Ownership is controlled by the backend and is not accepted from arbitrary client input.

### IDOR Protection
Post-management querysets are scoped by role and ownership. An Author cannot access another user's private Post by modifying a slug or identifier.

### Least Privilege
Roles are independent. Administrator does not automatically receive Editor access. Editor does not automatically receive Administrator access.

### Privilege-Escalation Prevention
Public registration and normal user serializers do not expose:
* Groups
* `is_staff`
* `is_superuser`
* User permissions

Future role assignment APIs must validate roles against an approved allowlist.

### Fail-Closed Behavior
Unauthenticated users, users without required roles, and incorrectly configured permissions are denied.

### Backend Enforcement
Hidden frontend controls are not treated as permission enforcement. All security decisions occur on the backend.

### Soft-Delete Protection
Management querysets exclude soft-deleted objects unless a dedicated recovery workflow explicitly requires them.

### Draft Protection
Public Post endpoints continue excluding drafts and unpublished Posts regardless of role architecture.

---

## Potential Attack Vectors

The feature addresses several important attack vectors.

### IDOR
* **Attack:** An Author changes a Post slug in the request URL to target another user's Post.
* **Protection:** Author-scoped queryset, object-level ownership permission.

### Privilege Escalation
* **Attack:** A client attempts to submit groups, `is_staff`, or `is_superuser` through registration or profile updates.
* **Protection:** Sensitive fields are not exposed by public serializers. Role assignment is reserved for future Administrator-only workflows.

### Staff Flag Misuse
* **Attack or design risk:** A staff user receives editorial API access unintentionally.
* **Protection:** API editorial access is based on Editor group membership. `is_staff` no longer grants taxonomy management.

### Hidden Draft Disclosure
* **Attack:** An anonymous user attempts to retrieve a draft by guessing its slug.
* **Protection:** Public querysets contain only published, non-deleted Posts.

### Role Inheritance Expansion
* **Risk:** Administrator unintentionally receives all editorial capabilities.
* **Protection:** Roles are independent. Multiple capabilities require explicit multiple-group assignment.

## Manual Testing

Manual testing should verify the following authorization matrix.

### Posts
* Anonymous user can list published Posts.
* Anonymous user can retrieve a published Post.
* Anonymous user cannot retrieve a draft Post.
* Authenticated user without a role cannot create a Post.
* Author can create a Post.
* Editor can create a Post.
* Administrator-only user cannot create a Post.
* Author can update an owned Post.
* Author cannot update another user's Post.
* Author receives `404` for another user's private Post when queryset scoping applies.
* Editor can update any active Post.
* Administrator-only user cannot update a Post.
* Author can soft-delete an owned Post.
* Author cannot soft-delete another user's Post.
* Editor can soft-delete any active Post.
* Author can publish an owned Post.
* Author cannot publish another user's Post.
* Editor can publish any active Post.
* Author can unpublish an owned Post.
* Editor can unpublish any active Post.
* Author can manage an owned featured image.
* Author cannot manage another user's featured image.
* Editor can manage any active Post's featured image.

### Categories
* Anonymous user can list Categories.
* Anonymous user can retrieve a Category.
* Author cannot create a Category.
* Author cannot update a Category.
* Editor can create a Category.
* Editor can update a Category.
* Administrator-only user cannot modify Categories.
* Staff-only user without Editor role cannot modify Categories.

### Tags
* Anonymous user can list Tags.
* Anonymous user can retrieve a Tag.
* Author cannot create a Tag.
* Author cannot update a Tag.
* Editor can create a Tag.
* Editor can update a Tag.
* Administrator-only user cannot modify Tags.
* Staff-only user without Editor role cannot modify Tags.

### Role Independence
* Author permission returns true only for Author members.
* Editor permission returns true only for Editor members.
* Administrator permission returns true only for Administrator members.
* Editor + Administrator user receives both capability sets.
* Administrator-only user does not receive Editor capabilities.
* Staff-only user receives no application role automatically.

### Data Migration
* Author group exists after migrations.
* Editor group exists after migrations.
* Administrator group exists after migrations.
* Re-running migration logic does not create duplicate groups.

---

## Automated Testing Strategy

Automated testing remains a future project task, but Feature 14 should eventually include strong permission coverage.

### Unit Tests
Unit tests should verify:
* `IsAuthor`
* `IsEditor`
* `IsAdministrator`
* `IsEditorOrReadOnly`
* Group membership behavior
* Unauthenticated-user behavior
* Missing-role behavior
* Multi-role behavior

These tests prevent regressions inside reusable permission primitives.

### API Tests
API tests should verify:
* Public Post access
* Draft exclusion
* Author Post creation
* Editor Post creation
* Administrator Post denial
* Category write restrictions
* Tag write restrictions
* Featured-image authorization

These tests verify the full request lifecycle.

### Permission Tests
Permission tests should verify:
* Role-level access
* Object ownership
* Editor override behavior
* Staff-role separation
* Administrator independence

These tests prevent accidental privilege expansion.

### Security Tests
Security-focused tests should verify:
* IDOR attempts
* Draft enumeration
* Soft-deleted object access
* Role injection attempts
* `is_staff` misuse
* `is_superuser` exposure
* Unauthorized cross-user resource modification

---

## Files Created

The following files were introduced for Feature 14:
* `backend/apps/core/permissions/__init__.py`
* `backend/apps/core/permissions/base.py`
* `backend/apps/core/permissions/roles.py`
* `backend/apps/users/constants.py`
* `backend/apps/users/migrations/<role-group-data-migration>.py`
* `docs/ADR/ADR-018-Role-Based-Authorization-Architecture.md`
* `docs/feature/Feature-14-Permissions-and-Authorization.md`

Depending on final cleanup, temporary permission-learning files may have been removed rather than retained.

---

## Files Modified

The following areas were modified:
* `backend/apps/posts/permissions.py`
* `backend/apps/posts/views.py`
* `backend/apps/categories/views.py`
* `backend/apps/tags/views.py`
* `backend/apps/core/permissions/__init__.py`
* `docs/Project-Status.md`

Obsolete application-specific taxonomy permission files should be removed when they are no longer referenced:
* `backend/apps/categories/permissions.py`
* `backend/apps/tags/permissions.py`

The exact migration filename depends on the migration number generated in the Users application.

---

## Files Removed

Obsolete permission files may include:
* `backend/apps/categories/permissions.py`
* `backend/apps/tags/permissions.py`

These files previously used Django staff status for taxonomy management. They are no longer required after Categories and Tags adopt the shared:

`IsEditorOrReadOnly`

permission.

Unused speculative permission abstractions should also be removed when they have no production consumer.

---

## Documentation Updates

### New Documents
* `docs/ADR/ADR-018-Role-Based-Authorization-Architecture.md`
* `docs/feature/Feature-14-Permissions-and-Authorization.md`

### Updated Documents
* `docs/Project-Status.md`

Optional small updates may also be applied to:
* `README.md`

only when required to reflect the current milestone and role architecture.

### Unchanged Documents
The following core documents may remain unchanged under the reduced documentation strategy unless their existing content becomes inaccurate:
* `docs/API-Specification.md`
* `docs/Architecture.md`
* `docs/Authentication-Flow.md`
* `docs/Database-Design.md`
* `docs/Testing-Strategy.md`

Feature 14 is primarily documented through:
* The Feature Completion Report
* ADR-018
* Project Status

---

## Key Engineering Concepts

Feature 14 covers the following concepts:
* Authentication versus authorization
* Role-Based Access Control
* Django Groups
* Independent roles
* Multiple roles per user
* DRF permission classes
* Permission composition
* Logical AND and OR permission rules
* Object-level permissions
* Queryset-level security
* Least privilege
* Defense in depth
* IDOR prevention
* Privilege-escalation prevention
* Data migrations
* Historical migration models
* Runtime constants
* Django staff versus application roles
* Backend-enforced authorization
* Fail-closed security

---

## Advantages

The implemented architecture provides several advantages:
* Centralized authorization logic
* Reusable role permissions
* Explicit role responsibilities
* Support for multiple roles per user
* Separation of Django Admin access and application permissions
* Strong ownership enforcement
* Better IDOR protection
* Reduced duplicated permission code
* Clearer code reviews
* Easier future user-management integration
* Better least-privilege enforcement
* Improved maintainability

---

## Disadvantages

The architecture also introduces trade-offs:
* More permission classes must be understood and maintained.
* Group membership checks may generate additional database queries.
* Multi-layer authorization requires more tests.
* Permission composition can become confusing when rules are poorly named.
* Role assignment becomes a security-sensitive operation.
* Independent roles require explicit multiple-role assignment for combined responsibilities.

These disadvantages are acceptable because the architecture provides better security and flexibility than staff-based authorization.

---

## Production Considerations

Before production deployment:
* Add automated permission tests.
* Add API-level authorization regression tests.
* Add security tests for IDOR and privilege escalation.
* Confirm role groups exist in every environment.
* Prevent arbitrary Group creation through application APIs.
* Add audit logging for future role changes.
* Consider caching or prefetching group membership if profiling shows excessive queries.
* Restrict Django Admin access separately from application roles.
* Define an operational process for assigning the first Administrator.
* Review role changes during deployment.
* Document emergency access and account recovery procedures.
* Add transactional behavior to future role-assignment services.
* Protect against self-deactivation and self-role-removal in future user administration.

---

## Alternatives Considered

### 1. Continue Using `is_staff`
* **Status:** *Rejected* because it mixes Django Admin access with application editorial permissions.

### 2. Add a Single Role Field to User
* **Status:** *Rejected* because it restricts users to one role and duplicates Django Group functionality.

### 3. Use Hierarchical Roles
* **Status:** *Rejected* because Administrator should not automatically inherit Editor capabilities.

### 4. Use Django Groups
* **Status:** *Accepted* because Django Groups:
  * Are built into Django
  * Support multiple roles per user
  * Integrate with the authentication framework
  * Avoid a custom role table
  * Support future permission expansion

---

## Common Mistakes Avoided

### Treating Authentication as Authorization
A valid JWT proves identity but does not prove the user may perform every operation.

### Relying on Frontend Restrictions
Hidden buttons and protected routes do not stop direct API requests.

### Using `is_staff` as Editor Role
Django staff status controls framework administration and should not represent business responsibilities.

### Making Administrator a Super-Role
Automatically granting Administrator all editorial capabilities violates least privilege.

### Combining Role and Ownership Logic
Role permissions and object ownership answer different questions and should remain separate.

### Trusting Client-Supplied Ownership
The backend must assign ownership from `request.user` rather than accepting arbitrary user identifiers.

### Returning All Posts Before Permission Checks
Unscoped querysets may expose private object existence or enable IDOR.

### Importing Runtime Constants into Migrations
Historical migrations should not depend on future runtime code.

### Exposing Groups in Public Serializers
Allowing public clients to modify group membership creates privilege-escalation risk.

### Assuming Superusers Are Normal Administrators
Django superusers have unrestricted framework permissions and should remain operational accounts rather than everyday application roles.

---

## Refactoring Opportunities

Future improvements may include:
* A reusable `user_has_role()` helper
* Request-level caching of role names
* Group prefetching for role-heavy requests
* Fine-grained Django model permissions
* `django-guardian` object permissions
* Dedicated role-assignment service
* Role-change audit logs
* Administrative action history
* Comment moderation permissions
* Editorial review workflow
* Approval and rejection states
* Custom permission-denied error messages
* Centralized authorization policy documentation
* Automated authorization-matrix tests

Refactoring should be driven by real duplication, performance evidence, or new business requirements.

---

## Feature Completion Status

Feature 14 is complete when the following items are verified:
* Application role constants implemented
* Author Group created
* Editor Group created
* Administrator Group created
* Role data migration applied
* Shared role permission classes implemented
* Post create authorization updated
* Post management authorization updated
* Post Editor override implemented
* Author queryset scoping implemented
* Editor queryset scoping implemented
* Category authorization migrated to Editor role
* Tag authorization migrated to Editor role
* Obsolete staff-based permission code removed
* Django system check passes
* Manual authorization regression testing completed
* ADR-018 created
* Feature 14 Completion Report created
* Project Status updated

---

## Final Outcome

Feature 14 establishes the production authorization foundation for the Blog Platform. The application now uses:

> JWT Authentication + Django Group Roles + DRF Role Permissions + Scoped Querysets + Object-Level Permissions + Backend Business Validation

### The final role model is:
* Author
* Editor
* Administrator

This architecture provides clear responsibility boundaries, least-privilege access, stronger IDOR protection, reusable permissions, and a secure foundation for future user administration and editorial workflows.