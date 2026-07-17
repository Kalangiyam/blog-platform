# ADR-015 — User Profiles Architecture

## Status

* **Status:** Accepted
* **Date:** 2026-07-17
* **Feature:** Feature 11 — User Profiles

---

# Context

The platform currently supports:

* User Authentication
* Posts
* Categories
* Tags
* Comments

At the completion of Feature 10, user-related information existed only within the custom User model.

The User model is responsible for:

* Authentication
* Identity
* Authorization

As the platform evolves, additional user-facing information is required, including:

* Biography
* Website
* Location
* Date of Birth

Storing profile information directly inside the User model would tightly couple authentication concerns with profile management concerns and make future profile enhancements more difficult.

The platform therefore requires a dedicated Profile domain that can evolve independently while maintaining a clear separation of responsibilities.

---

# Decision

A dedicated Profiles application will be introduced.

The Profile domain will extend the User domain through a one-to-one relationship.

```text
User (1) ────── (1) Profile
```

The Profile model will contain only profile-related information while authentication and authorization data remain in the User model.

---

# Profile Domain Architecture

A new Django application named `profiles` is introduced.

```text
apps/
├── profiles/
│   ├── admin.py
│   ├── models.py
│   ├── serializers.py
│   ├── signals.py
│   ├── urls.py
│   ├── views.py
│   └── migrations/
```

The application owns:

* Profile model
* Profile APIs
* Profile serialization
* Profile administration
* Automatic profile creation

The application does not own:

* Authentication
* JWT management
* Password management
* User registration
* User authorization

These responsibilities remain within the Users domain.

---

# Database Design

The Profile model is implemented as a one-to-one extension of the User model.

```python
user = models.OneToOneField(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="profile",
)
```

Profile fields:

* bio
* website
* location
* date_of_birth

Inherited fields:

* created_at
* updated_at

via:

```python
TimeStampedModel
```

---

# Base Model Strategy

The Profile model inherits only from:

```python
TimeStampedModel
```

The Profile model does not inherit:

```text
AuditModel
SoftDeleteModel
ActiveStatusModel
```

Reasons:

### AuditModel

Profile ownership is already established through the one-to-one User relationship.

Tracking `created_by` and `updated_by` would provide little additional value.

### SoftDeleteModel

A Profile has no independent lifecycle.

If a User is physically deleted, the Profile should also be deleted.

### ActiveStatusModel

Profiles are not reference entities and do not require activation or deactivation behavior.

---

# User Deletion Strategy

The relationship uses:

```python
on_delete=models.CASCADE
```

This ensures:

```text
User deleted
      ↓
Profile deleted
```

A Profile cannot exist without a corresponding User.

This preserves referential integrity.

---

# Automatic Profile Creation

The project adopts automatic Profile creation through Django signals.

A `post_save` signal is registered on the configured User model.

Whenever a new User is created:

```text
User Created
      ↓
post_save Signal
      ↓
Profile Created
```

Benefits:

* Consistent behavior
* Works across all user creation paths
* Supports future imports
* Supports future OAuth integrations
* Supports future management commands

---

# Existing User Backfill

Because Profiles were introduced after Users already existed, a dedicated data migration was created.

The migration:

* Detects Users without Profiles
* Creates missing Profiles
* Preserves existing Profile records
* Avoids duplicate creation

This guarantees:

```text
Every User has exactly one Profile
```

after migration execution.

---

# API Architecture

The Profile domain exposes two API surfaces.

## Current User Profile

Authenticated endpoint:

```http
GET /api/profile/
PATCH /api/profile/
```

Purpose:

* Retrieve current profile
* Update current profile

The Profile is always selected using:

```python
request.user
```

No profile identifiers are exposed.

---

## Public Profile

Public endpoint:

```http
GET /api/users/{username}/profile/
```

Purpose:

* View author profile information

The endpoint exposes only safe public information.

---

# Serializer Separation Strategy

The project continues using action-specific serializers.

Implemented serializers:

```text
ProfileSerializer
ProfileUpdateSerializer
PublicProfileSerializer
```

Benefits:

* Clear responsibilities
* Reduced accidental data exposure
* Easier maintenance
* Future extensibility

---

# Security Decisions

## Ownership Enforcement

Profile ownership is enforced through:

```python
request.user.profile
```

Clients never provide:

* Profile ID
* User ID

This prevents ownership manipulation.

---

## IDOR Prevention

The update endpoint:

```http
PATCH /api/profile/
```

does not expose object identifiers.

This removes a common Insecure Direct Object Reference (IDOR) attack vector.

---

## Privacy Controls

Public Profile responses exclude:

* email
* date_of_birth
* internal identifiers
* audit metadata

Private Profile responses include only information owned by the authenticated user.

---

## Validation

Profile updates validate:

* Website URL format
* Date of birth cannot be in the future

Validation is performed within serializers.

---

# Query Optimization

Profile APIs use:

```python
select_related("user")
```

Benefits:

* Reduces database queries
* Prevents N+1 query issues
* Improves API efficiency

This follows the optimization strategy already established throughout the platform.

---

# Alternatives Considered

## Store Profile Fields Inside User

Example:

```python
class User(AbstractUser):
    bio = ...
    website = ...
```

Advantages:

* Fewer tables
* Simpler implementation

Disadvantages:

* Violates separation of concerns
* User model grows unnecessarily
* Harder future expansion

Rejected.

---

## Manual Profile Creation

Example:

```python
Profile.objects.create(...)
```

inside registration logic.

Advantages:

* Explicit behavior

Disadvantages:

* Easy to forget in future user creation paths
* Less maintainable

Rejected.

---

## CRUD Profile API

Example:

```http
GET /api/profiles/{id}/
PATCH /api/profiles/{id}/
```

Advantages:

* Conventional CRUD

Disadvantages:

* Exposes object identifiers
* Increases IDOR risk
* Requires additional ownership checks

Rejected.

---

# Consequences

Positive:

* Clear separation between authentication and profile concerns
* Scalable architecture
* Future avatar support
* Future social-link support
* Improved maintainability
* Improved security
* Consistent ownership enforcement

Negative:

* Additional database table
* Signal-based behavior introduces implicit execution
* Additional migration complexity

These trade-offs are acceptable given the long-term scalability and maintainability benefits.

---

# Result

Feature 11 introduces a dedicated User Profiles domain that:

* Extends the User model through a one-to-one relationship
* Provides authenticated profile management
* Provides public author profiles
* Preserves privacy boundaries
* Prevents ownership-based attacks
* Supports future profile expansion without modifying the authentication domain

This architecture aligns with the project's principles of:

* Separation of Concerns
* Maintainability
* Scalability
* Security
* Production-Ready Design