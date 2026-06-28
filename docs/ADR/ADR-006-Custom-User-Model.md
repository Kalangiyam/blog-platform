# ADR-006: Custom User Model

* **Status:** Accepted
* **Date:** 2026-06-27
* **Author:** Kalangiyam

---

# Context

Django provides a built-in `User` model that is sufficient for many simple applications. However, replacing the default user model after the initial database migrations have been created is a complex and error-prone process.

The Blog Platform is designed as a production-grade application that will evolve to support additional user-related functionality such as authentication, user profiles, role-based permissions, and ownership checks.

To avoid future migration complexity and provide long-term flexibility, the user model must be customizable from the beginning of the project.

---

# Decision

The project adopts a **custom User model** from the start of development.

The implementation includes:

* Creating a dedicated `users` application.
* Creating a `User` model that inherits from Django's `AbstractUser`.
* Configuring `AUTH_USER_MODEL` before the initial database migration.
* Using the custom User model throughout the project for all authentication and user relationships.

This establishes a flexible foundation while retaining Django's built-in authentication capabilities.

---

# Rationale

Using a custom User model from the beginning is considered a Django best practice for production applications.

Key benefits include:

* Future-proof architecture.
* Easy addition of custom user fields.
* Seamless integration with JWT authentication.
* Support for user profiles.
* Support for role-based authorization.
* Simplified relationships with future models.
* Eliminates the need for complex user model migrations later.

By inheriting from `AbstractUser`, the project retains Django's mature authentication system while allowing future customization when required.

---

# Alternatives Considered

## Option 1 — Default Django User Model

### Advantages

* Minimal initial setup.
* Suitable for very small or prototype applications.
* No additional configuration required.

### Disadvantages

* Difficult to extend after migrations.
* Requires complex migration strategies if customization is needed later.
* Limits long-term flexibility.
* Not ideal for production-grade applications.

---

## Option 2 — Custom User Model Using `AbstractUser` (Selected)

### Advantages

* Future-proof design.
* Easy to extend with additional fields.
* Full compatibility with Django's authentication framework.
* Supports JWT authentication.
* Supports user profiles and role-based permissions.
* Simplifies future feature development.

### Disadvantages

* Slightly more initial setup.
* Requires configuring `AUTH_USER_MODEL` before the first migration.
* Developers must consistently reference the custom user model throughout the project.

---

# Consequences

## Positive

* Flexible authentication architecture.
* Easier future development.
* Simplified integration with related models.
* Production-ready user management foundation.
* Avoids one of the most common architectural mistakes in Django projects.

## Negative

* Additional configuration during project initialization.
* Requires awareness of the custom user model when creating relationships and migrations.
* Mistakes in the initial setup can require recreating migrations during early development.

---

# Impact on Future Development

All future authentication and user-related features will build upon this custom User model.

Future enhancements may include:

* Custom user fields.
* User profiles.
* JWT authentication.
* Role-based permissions.
* Object-level authorization.
* Social authentication providers.
* Account verification and recovery features.

By making this decision before the initial migration, the project avoids costly schema changes and establishes a scalable authentication foundation for the remainder of the application's lifecycle.
