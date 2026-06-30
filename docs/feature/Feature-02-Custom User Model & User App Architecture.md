# Feature 02 — Custom User Model & User App Architecture

**Project:** Production-Grade Blog Platform
**Feature ID:** Feature 02
**Status:** ✅ Completed
**Technology Stack:** Django, Django REST Framework, PostgreSQL

---

# 1. Feature Summary

Feature 02 establishes the authentication foundation of the Blog Platform by implementing a custom Django User model before the first database migration.

The feature follows Django's recommended best practice of replacing the default `auth.User` model at the beginning of the project to ensure long-term flexibility and maintainability.

This implementation prepares the project for future authentication features such as JWT, email-based login, profile management, role-based permissions, and object-level authorization.

---

# 2. Business Objective

The authentication system is the central identity provider for the entire application.

Every major feature depends on authenticated users, including:

* Creating blog posts
* Managing comments
* User profiles
* Permissions
* Roles
* Ownership validation
* Audit trails

Implementing a custom User model before the first migration eliminates the need for complex migration strategies later in the project.

---

# 3. Architecture Summary

## High-Level Architecture

```text
React Frontend
       │
       ▼
Django REST Framework
       │
       ▼
Authentication System
       │
       ▼
Custom User Model
       │
       ▼
PostgreSQL
```

---

## Request Flow

```text
Client Request
      │
      ▼
Django Authentication
      │
      ▼
Custom User Model
      │
      ▼
Database
```

---

## Response Flow

```text
PostgreSQL
      │
      ▼
Django ORM
      │
      ▼
Authentication Layer
      │
      ▼
JSON Response / Admin Interface
```

---

## Database Flow

```text
User Model
      │
      ▼
Migration
      │
      ▼
SQL
      │
      ▼
PostgreSQL
```

---

# 4. Implementation Summary

The following tasks were completed during this feature:

* Created the `users` application.
* Registered the application in `INSTALLED_APPS`.
* Implemented a custom `User` model using `AbstractUser`.
* Configured a unique email field.
* Configured `AUTH_USER_MODEL`.
* Registered the custom User model in Django Admin.
* Generated the initial migrations.
* Applied the first database migrations.
* Created the initial superuser.
* Verified Django Admin integration.

---

# 5. Files Created / Modified

## New Application

```text
backend/apps/users/
```

---

## Files

| File                                    | Purpose                   |
| --------------------------------------- | ------------------------- |
| `apps/users/models.py`                  | Custom User model         |
| `apps/users/admin.py`                   | Django Admin registration |
| `apps/users/apps.py`                    | Application configuration |
| `apps/users/migrations/0001_initial.py` | Initial database schema   |
| `config/settings/base.py`               | User model configuration  |

---

# 6. User Model Design

The custom User model inherits from Django's `AbstractUser`.

## Inherited Features

* Username
* Password
* First Name
* Last Name
* Staff Status
* Superuser Status
* Active Status
* Groups
* Permissions
* Last Login
* Date Joined

## Customizations

| Field   | Description                         |
| ------- | ----------------------------------- |
| `email` | Unique email address for every user |

The project will later transition to email-based authentication while retaining Django's built-in compatibility.

---

# 7. Authentication Foundation

The project is now configured to use:

```python
AUTH_USER_MODEL = "users.User"
```

This ensures every future relationship references the custom User model instead of Django's default authentication model.

Future models must always reference:

```python
settings.AUTH_USER_MODEL
```

instead of:

```python
django.contrib.auth.models.User
```

---

# 8. Database Changes

The initial migration created the authentication foundation including:

* Custom User table
* Django authentication tables
* Django admin tables
* Session tables
* Permission tables
* Content type tables
* Migration tracking table

---

# 9. Security Considerations

Implemented:

* Custom User model from project inception.
* Secure password hashing provided by Django.
* Unique email constraint.
* Django Groups support.
* Django Permissions support.
* Django Admin integration.
* Proper `AUTH_USER_MODEL` configuration before migrations.

Planned:

* JWT Authentication
* Refresh Tokens
* Email Login
* Password Reset
* Email Verification
* Object-Level Permissions
* Rate Limiting

---

# 10. Scalability Considerations

The chosen architecture supports future enhancements without requiring schema redesign.

Future capabilities include:

* User Profiles
* Avatar uploads
* Email verification
* Multi-factor authentication
* OAuth providers
* Activity logging
* Team and organization support

---

# 11. Permissions

Current permission foundation:

* Anonymous users
* Authenticated users
* Staff users
* Superusers
* Django Groups
* Django Permissions

Future features will introduce:

* Writer role
* Editor role
* Admin role
* Object-level permissions
* `django-guardian`

---

# 12. Testing Status

Automated tests have not yet been implemented because authentication APIs are introduced in the next feature.

Planned test coverage includes:

## Unit Tests

* User creation
* Email uniqueness
* String representation

## Integration Tests

* Django Admin
* Authentication workflow

## API Tests

* Registration
* Login
* Profile endpoints

## Permission Tests

* Anonymous access
* Authenticated access
* Role-based permissions

---

# 13. Key Concepts Learned

This feature introduced the following concepts:

* Custom User Model
* `AbstractUser`
* `AUTH_USER_MODEL`
* Django Application Registry
* Django Admin
* Django Authentication System
* Database Migrations
* Migration Workflow
* Authentication Architecture
* User Identity Design

---

# 14. Interview Questions

## Beginner

1. What is `AUTH_USER_MODEL`?
2. Why create a custom User model?
3. What is the purpose of `INSTALLED_APPS`?
4. What is the difference between `makemigrations` and `migrate`?

---

## Intermediate

1. Why must a custom User model be created before the first migration?
2. What problems occur when replacing `auth.User` later?
3. Why should foreign keys use `settings.AUTH_USER_MODEL`?

---

## Advanced

1. Compare `AbstractUser` and `AbstractBaseUser`.
2. Explain Django's authentication architecture.
3. How does Django resolve `AUTH_USER_MODEL`?
4. How would you migrate a production project from `auth.User` to a custom User model?

---

# 15. Common Mistakes

Avoid the following:

* Running migrations before implementing the custom User model.
* Importing `django.contrib.auth.models.User`.
* Storing profile information inside the User model.
* Rewriting Django's authentication unnecessarily.
* Forgetting to configure `AUTH_USER_MODEL`.
* Forgetting to register the model in Django Admin.

---

# 16. Refactoring Opportunities

Future improvements include:

* Custom User Manager
* Email-based authentication
* Profile model
* Authentication service layer
* Custom admin configuration
* Dedicated test package
* Audit logging
* Soft deletion support (if required)

---

# 17. Documentation Updates

## Updated

* README.md
* Architecture.md
* Database-Design.md

## New

* Authentication-Flow.md
* API-Specification.md
* Testing-Strategy.md
* ADR-006-Custom-User-Model.md

---

# 18. Feature Outcome

## Completed

* Custom User model
* User application
* Django Admin integration
* Database initialization
* Initial migrations
* Superuser creation

## Pending

* JWT Authentication
* Registration API
* Login API
* Logout API
* Refresh Tokens
* Password Reset
* Profile API

---

# 19. Next Feature

## Feature 03 — JWT Authentication Foundation & User Authentication APIs

The next feature will implement:

* Simple JWT configuration
* JWT authentication architecture
* Access tokens
* Refresh tokens
* Login endpoint
* Logout endpoint
* Authentication serializers
* Protected API endpoints
* Authentication testing

This feature builds directly upon the authentication foundation established in Feature 02.
