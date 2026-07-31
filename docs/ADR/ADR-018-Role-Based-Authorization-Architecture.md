# ADR-018 — Role-Based Authorization Architecture

## Status

- **Status:** Accepted
- **Date:** 2026-07-30
- **Feature:** Feature 14 — Permissions & Authorization

---

# Context

The Blog Platform already used JWT authentication and several endpoint-specific permission checks.

Before Feature 14, authorization rules were distributed across individual applications and relied on a mixture of:

- `IsAuthenticated`
- `AllowAny`
- Django `is_staff`
- Domain-specific ownership permissions
- Action-specific `get_permissions()` methods
- Queryset filtering

This approach worked during the earlier stages of the project, but it introduced several architectural risks as the application expanded.

The main problems were:

- Authorization rules were spread across multiple applications.
- Django staff status was being used as an application business role.
- Reusable permission logic was duplicated.
- The application had no explicit role-based access-control model.
- Role checks and object ownership checks were not clearly separated.
- Future user-administration and editorial workflows required clearer security boundaries.
- Incorrect permission composition could create IDOR or privilege-escalation vulnerabilities.

Feature 14 introduces a centralized and reusable authorization architecture based on Django Groups, Django REST Framework permission classes, queryset scoping, and object-level permissions.

---

# Decision

The application will use Django Groups to represent application-level roles.

The initial application roles are:

- `Author`
- `Editor`
- `Administrator`

These roles are independent and are not automatically hierarchical.

A user may belong to more than one group when they require multiple business responsibilities.

For example:

```text
Editor + Administrator
```
This explicitly grants both editorial and administrative capabilities without making every Administrator an Editor.

## Role Responsibilities

### Author
An Author may:
* Create posts
* Manage their own posts
* Publish and unpublish their own posts
* Upload, replace, and remove featured images for their own posts
* Create comments
* Manage their own comments

An Author may not:
* Manage another Author's posts
* Manage categories or tags
* Manage users
* Assign application roles

### Editor
An Editor may:
* Create posts
* Manage any active post
* Publish and unpublish any active post
* Manage featured images for any active post
* Manage categories
* Manage tags
* Perform future editorial and moderation operations

> An Editor does not automatically receive user-administration privileges.

### Administrator
An Administrator may:
* View publicly available posts
* Use future user-management APIs
* Assign and remove approved application roles
* Activate or deactivate users through future administrative workflows

An Administrator may not automatically:
* Create posts
* Update or delete posts
* Publish or unpublish posts
* Manage featured images
* Manage categories or tags
* Perform editorial operations

> An Administrator who also requires editorial capabilities must additionally belong to the Editor group.

---

## Django Staff and Superuser Flags

Application roles are separate from Django's framework-level flags.

### `is_staff`
`is_staff` controls access to Django staff functionality, including the Django Admin site. It does not automatically grant application-level Editor or Administrator permissions.

### `is_superuser`
`is_superuser` represents unrestricted Django permission access. It should be assigned only to trusted platform operators and must not be used as a normal application role.

The application must not expose public APIs that allow users to assign themselves:
* `is_staff`
* `is_superuser`
* Arbitrary Django permissions

---

## Shared Permission Architecture

Reusable Django REST Framework permission classes are stored in:
`backend/apps/core/permissions/`

This package contains cross-domain authorization policies.

### Role-based permissions include:
* `IsAuthor`
* `IsEditor`
* `IsAdministrator`
* `IsEditorOrReadOnly`

A shared base permission performs Django Group membership checks. Conceptually:

```python
request.user.groups.filter(
    name=required_group,
).exists()
```
Role names are stored as constants in `backend/apps/users/constants.py`:

```python
AUTHOR_GROUP = "Author"
EDITOR_GROUP = "Editor"
ADMINISTRATOR_GROUP = "Administrator"
```
This prevents inconsistent role-name strings throughout runtime application code.

## Group Creation Strategy

Application groups are created through a Django data migration. The migration creates:

* Author
* Editor
* Administrator

Using a data migration ensures that role records are created consistently in:

* Local development
* Testing
* Staging
* Production
* Newly created databases

The migration uses `apps.get_model("auth", "Group")` to preserve historical migration compatibility, and `get_or_create()` to prevent duplicate group records.

The migration intentionally stores fixed role-name strings rather than importing runtime constants because migrations must remain historically stable.

---

## Permission Composition

Django REST Framework permission composition is used when multiple roles may perform an action. For example:

`IsAuthor | IsEditor`

means: **Author OR Editor**

When combined with a permission-class collection:

```python
(
    IsAuthenticated,
    IsAuthor | IsEditor,
    IsPostAuthor,
)
```

The effective authorization rule is:

> **Authenticated AND (Author OR Editor) AND Object-level post permission**

This provides explicit and auditable authorization logic.

---

## Posts Authorization

Public Post actions remain accessible through public permissions and published-queryset filtering. Public actions include:
* List published posts
* Retrieve published posts
* Search published posts

### Post creation requires:
> **Authenticated AND (Author OR Editor)**

### Post-management actions require:
> **Authenticated AND (Author OR Editor) AND Post object permission**

Management actions include:
* Update
* Partial update
* Soft delete
* Publish
* Unpublish
* Featured-image upload
* Featured-image replacement
* Featured-image removal

---

## Object-Level Authorization

The existing Post object permission was extended to support the new role model:
* **Editor** $\rightarrow$ May manage any accessible post
* **Author** $\rightarrow$ May manage only owned posts

Role permission and ownership permission remain separate concerns:
* **Role permission answers:** May this user perform this category of action?
* **Object-level permission answers:** May this user perform the action on this specific object?

This separation prevents group membership alone from bypassing ownership rules.

---

## Queryset Scoping

Queryset filtering is used in addition to object-level permission checks. For Post management actions:
* **Editor** $\rightarrow$ Receives all active, non-deleted posts
* **Author** $\rightarrow$ Receives only posts owned by the current user

This means an Author attempting to access another Author's private post normally receives `404 Not Found` rather than `403 Forbidden`.

The scoped queryset reduces object enumeration and strengthens IDOR protection. Object-level permissions are still enforced as defense in depth.

---

## Categories and Tags Authorization

Category and Tag read operations remain public. Write operations require the Editor role. The effective rule is:
* **Safe HTTP method** $\rightarrow$ Public access
* **Unsafe HTTP method** $\rightarrow$ Authenticated Editor only

The application no longer uses `is_staff` to authorize Category or Tag API writes. This separates Django Admin access from application editorial permission:
* An Editor does not need `is_staff=True` to manage Categories and Tags through the API.
* An Administrator or staff user without the Editor role may not modify Categories or Tags.

---

## Security Principles

The authorization architecture follows these principles:

### Least Privilege
Users receive only the roles required for their responsibilities. Administrator does not automatically inherit Editor or Author privileges.

### Backend Enforcement
Authorization is enforced by the Django REST Framework backend. Frontend navigation, hidden buttons, and route guards are not considered security controls.

### Fail Closed
Missing or incorrectly configured role requirements deny access rather than granting it.

### Defense in Depth
Protected operations may use multiple controls:
* Authentication
* Role permissions
* Queryset scoping
* Object-level permissions
* Serializer validation
* Service-layer business rules

### IDOR Prevention
Ownership checks and scoped querysets prevent users from accessing resources by changing URL identifiers.

### Privilege-Escalation Prevention
Clients cannot assign themselves application roles through public registration or normal profile-update endpoints. Future role assignment will require Administrator-only APIs and approved-role validation.

---

## Alternatives Considered

### 1. Continue Using `is_staff`
* **Advantages:** Simple, built into Django, no additional role records required.
* **Disadvantages:** Mixes Django Admin access with business roles, grants overly broad access, cannot express independent responsibilities, violates least privilege.
* **Status:** *Rejected.*

### 2. Store a Single Role Field on User
* **Advantages:** Simple role lookup, easy to expose through serializers, straightforward database representation.
* **Disadvantages:** Restricts users to one role, requires custom role infrastructure, duplicates capabilities already available through Django Groups, makes combined responsibilities harder to represent.
* **Status:** *Rejected.*

### 3. Hierarchical Roles
* **Advantages:** Simple capability inheritance, higher roles automatically receive lower-role permissions.
* **Disadvantages:** Conflicts with business rules (Administrator should manage users without managing content), creates unnecessary privilege expansion.
* **Status:** *Rejected.*

### 4. Independent Django Groups
* **Advantages:** Built into Django, supports multiple roles per user, integrates with Django's permission framework, explicit and flexible, supports future capability expansion, preserves least privilege.
* **Disadvantages:** Group membership requires database queries, role assignment must be protected carefully, multiple-role users require clear permission composition.
* **Status:** *Accepted.*

---

## Consequences

### Positive Consequences
* Authorization rules are centralized.
* Role responsibilities are explicit.
* Django staff access is separated from application roles.
* Permission classes are reusable across applications.
* Authors cannot manage other Authors' private content.
* Editors can manage editorial resources without Django Admin access.
* Administrators remain isolated from content-management privileges.
* Future user-management APIs have a clear authorization boundary.
* Security reviews become easier because policies are named and discoverable.

### Negative Consequences
* Authorization logic is more complex than a simple `is_staff` check.
* Role assignment becomes an important administrative operation.
* Group membership checks may introduce additional database queries.
* Multiple layers of authorization require careful testing.
* Changes to role responsibilities require updates to permissions, tests, and documentation.

---

## Production Considerations

### Automated tests should verify:
* Anonymous access
* Authenticated users without roles
* Author permissions
* Editor permissions
* Administrator permissions
* Users with multiple roles
* Object ownership
* Queryset scoping
* Public draft protection
* Soft-deleted object protection
* Featured-image ownership
* Category and Tag write restrictions
* Staff users without application roles
* Privilege-escalation attempts

### Future role-management APIs must:
* Require Administrator authorization
* Validate roles against an approved allowlist
* Prevent arbitrary Django Group assignment
* Prevent direct superuser assignment
* Prevent unsafe self-deactivation
* Prevent unsafe self-role removal
* Preserve auditability
* Use transactional role assignment

---

## Future Evolution

Future features may introduce:
* User-administration APIs
* Role-assignment services
* Account activation and deactivation
* Custom Django model permissions
* `django-guardian` object permissions
* Comment moderation workflows
* Editorial review workflows
* Audit logging
* Role-change history
* Permission-query optimization

These capabilities should build on the authorization boundaries established by this ADR.

---

## Decision Outcome

Feature 14 adopts independent application roles using Django Groups and centralized Django REST Framework permission classes.

### The final role model is:
* Author
* Editor
* Administrator

### Authorization is enforced through:
> Authentication + Role-based permissions + Queryset scoping + Object-level permissions + Backend business validation

This architecture provides a maintainable, scalable, and security-focused foundation for current and future application capabilities.