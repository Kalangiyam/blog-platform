# Feature 11 — User Profiles

## Feature Summary

### Feature Name

User Profiles

### Business Purpose

Introduce a dedicated User Profiles domain that separates profile-related information from authentication and authorization concerns.

The feature enables users to maintain public profile information while preserving a clean separation between account management and profile management.

### Implementation Summary

Feature 11 introduces:

* Profiles application
* Profile model
* User–Profile one-to-one relationship
* Automatic Profile creation through signals
* Existing-user Profile backfill migration
* Current User Profile API
* Public User Profile API
* Profile update API
* Profile administration through Django Admin
* Profile validation
* Query optimization
* Privacy controls

---

# Architecture Summary

## Domain Architecture

```text
User
 └── Profile
```

Relationship:

```text
User (1) ────── (1) Profile
```

Each User owns exactly one Profile.

Each Profile belongs to exactly one User.

---

## Request Flow

### Current Profile

```text
Client
    │
    ▼
JWT Authentication
    │
    ▼
request.user
    │
    ▼
request.user.profile
    │
    ▼
Serializer
    │
    ▼
Response
```

---

### Public Profile

```text
Client
    │
    ▼
Username
    │
    ▼
Profile Lookup
    │
    ▼
PublicProfileSerializer
    │
    ▼
Response
```

---

## Data Flow

### New User Creation

```text
User Created
      │
      ▼
post_save Signal
      │
      ▼
Profile Created
```

---

### Existing User Migration

```text
Existing Users
        │
        ▼
Data Migration
        │
        ▼
Missing Profiles Created
```

---

# Files Created

## New Application

```text
apps/profiles/
```

### Files

```text
apps/profiles/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── signals.py
├── urls.py
├── views.py
├── migrations/
└── tests/
```

---

## File Responsibilities

### models.py

Owns:

* Profile database schema
* User relationship
* Database metadata

---

### serializers.py

Owns:

* Profile API representation
* Profile validation
* Public/private response separation

---

### views.py

Owns:

* Current Profile API
* Public Profile API

---

### signals.py

Owns:

* Automatic Profile creation for new Users

---

### urls.py

Owns:

* Profile routing

---

### admin.py

Owns:

* Django Admin integration
* Search configuration
* Field organization
* Query optimization

---

# Files Modified

## config/settings/base.py

### Changes

Registered:

```python
apps.profiles.apps.ProfilesConfig
```

inside:

```python
INSTALLED_APPS
```

---

## config/urls.py

### Changes

Registered Profile API routes.

---

# Database Changes

## New Table

```text
profiles_profile
```

---

## Model

### Profile

Fields:

| Field         | Type          |
| ------------- | ------------- |
| id            | BigAutoField  |
| user          | OneToOneField |
| bio           | TextField     |
| website       | URLField      |
| location      | CharField     |
| date_of_birth | DateField     |
| created_at    | DateTimeField |
| updated_at    | DateTimeField |

---

## Relationship

```text
User (1)
    │
    ▼
Profile (1)
```

---

## Constraints

### One Profile Per User

Enforced by:

```python
OneToOneField
```

Database uniqueness guarantees:

```text
One User → One Profile
```

---

## Deletion Strategy

```python
on_delete=models.CASCADE
```

Behavior:

```text
Delete User
      ▼
Delete Profile
```

---

# APIs

## Current User Profile

### Retrieve Profile

```http
GET /api/profile/
```

Authentication:

```text
Required
```

Permission:

```text
Authenticated User
```

---

### Update Profile

```http
PATCH /api/profile/
```

Authentication:

```text
Required
```

Permission:

```text
Profile Owner
```

---

## Public User Profile

### Retrieve Public Profile

```http
GET /api/users/{username}/profile/
```

Authentication:

```text
Not Required
```

Permission:

```text
Public
```

---

# Serializers

## ProfileSerializer

Purpose:

```text
Return authenticated user's profile
```

Fields:

* username
* email
* bio
* website
* location
* date_of_birth

---

## ProfileUpdateSerializer

Purpose:

```text
Update profile information
```

Fields:

* bio
* website
* location
* date_of_birth

Validation:

* Future date prevention

---

## PublicProfileSerializer

Purpose:

```text
Return public profile information
```

Fields:

* username
* bio
* website
* location

Excluded:

* email
* date_of_birth

---

# Permissions

## Current Profile

Ownership enforced through:

```python
request.user.profile
```

No user identifier is accepted from clients.

---

## Public Profile

Read-only access.

No update operations available.

---

# Security Review

## Authentication

Protected endpoints:

```http
GET /api/profile/
PATCH /api/profile/
```

require JWT authentication.

---

## Authorization

Profile ownership enforced through:

```python
request.user
```

---

## IDOR Protection

No Profile IDs exposed.

Endpoint:

```http
PATCH /api/profile/
```

prevents clients from selecting another user's Profile.

---

## Privacy Controls

Public Profile excludes:

* email
* date_of_birth
* internal identifiers
* timestamps

---

## Validation

Implemented:

* URL validation
* Future date validation

---

## Mass Assignment Protection

Restricted writable fields:

* bio
* website
* location
* date_of_birth

Protected fields:

* user
* username
* email
* created_at
* updated_at

---

# Query Optimization

Implemented:

```python
select_related("user")
```

Benefits:

* Prevents N+1 queries
* Reduces database load
* Improves API performance

---

# Admin Integration

Implemented:

### List Display

* user
* location
* created_at
* updated_at

---

### Search

* username
* email
* location

---

### Read-Only Fields

* user
* created_at
* updated_at

---

### Fieldsets

#### Profile Owner

* user

#### Public Profile Information

* bio
* website
* location

#### Personal Information

* date_of_birth

#### System Information

* created_at
* updated_at

---

# Testing Coverage

## Manual Testing

Verified:

### Current Profile

* Retrieve profile
* Update profile
* Partial updates
* Anonymous access rejection

---

### Validation

* Invalid URL rejection
* Future date rejection

---

### Public Profile

* Public access
* Unknown user handling
* Privacy enforcement

---

### Security

* Ownership enforcement
* IDOR prevention
* Mass assignment protection

---

### Signals

* Automatic Profile creation
* No duplicate Profiles on User update

---

### Data Migration

* Existing User backfill
* One Profile per User verification

---

### Database

* User deletion cascades to Profile

---

# Key Learning Concepts

Feature 11 introduced:

* One-to-One Relationships
* Django Signals
* Data Migrations
* Profile Domain Design
* Separation of Concerns
* Generic DRF Views
* Serializer-Based Validation
* Public vs Private API Representations
* IDOR Prevention
* Query Optimization with `select_related()`
* Django Admin Customization

---

# Common Mistakes

## Storing Profile Fields in User

Problem:

```text
Authentication and Profile concerns become mixed.
```

Avoided through a dedicated Profile model.

---

## Manual Profile Creation

Problem:

```text
Future User creation paths may forget Profile creation.
```

Avoided through signals.

---

## Exposing Email Publicly

Problem:

```text
Sensitive information disclosure.
```

Avoided through a dedicated public serializer.

---

## Updating Profiles by ID

Problem:

```text
Potential IDOR vulnerability.
```

Avoided through:

```python
request.user.profile
```

---

## Missing Existing User Backfill

Problem:

```text
Existing Users have no Profile.
```

Avoided through a data migration.

---

# Refactoring Opportunities

Future enhancements may include:

* Avatar uploads
* Social media links
* Author statistics
* Public author pages
* Profile caching
* Profile activity feeds

These enhancements can be added without modifying the authentication architecture.

---

# Result

Feature 11 successfully introduces a dedicated User Profiles domain that:

* Extends the User model through a one-to-one relationship
* Provides authenticated profile management
* Provides safe public profile access
* Preserves privacy boundaries
* Supports future profile expansion
* Follows the project's architecture, security, and scalability standards