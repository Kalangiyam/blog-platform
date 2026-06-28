# ADR-005: Core App

* **Status:** Accepted
* **Date:** 2026-06-25
* **Author:** Kalangiyam

---

# Context

As the Blog Platform grows, multiple Django applications will require shared functionality. Duplicating common code across applications leads to increased maintenance effort, inconsistent implementations, and a higher risk of bugs.

A centralized location is needed for reusable components that are shared across the project.

---

# Decision

The project adopts a dedicated `core` application to contain functionality that is shared by multiple business applications.

```text
backend/
│
├── apps/
│   ├── core/
│   ├── users/
│   ├── posts/
│   ├── comments/
│   └── ...
```

The `core` application is **not** responsible for business features. Instead, it provides reusable building blocks that can be used throughout the project.

---

# Rationale

A dedicated `core` application promotes code reuse while keeping business applications focused on their own responsibilities.

Key benefits include:

* Reduces duplicated code.
* Encourages consistency across applications.
* Simplifies maintenance.
* Supports modular architecture.
* Keeps shared functionality in a single, well-defined location.

This follows the **Don't Repeat Yourself (DRY)** principle and aligns with clean architecture practices.

---

# Future Responsibilities

The `core` application may contain shared components such as:

* Abstract base models
* Utility functions
* Shared constants
* Custom permissions
* Common validators
* Custom exceptions
* Shared mixins
* Helper functions

Only functionality used by **multiple applications** should be placed in `core`.

---

# Alternatives Considered

## Option 1 — Duplicate Shared Code

### Advantages

* Simpler for very small projects.
* No additional application required.

### Disadvantages

* Code duplication.
* Inconsistent implementations.
* Harder maintenance.
* Increased risk of bugs.

---

## Option 2 — Dedicated `core` Application (Selected)

### Advantages

* Centralized shared functionality.
* Better maintainability.
* Encourages code reuse.
* Cleaner business applications.
* Supports long-term scalability.

### Disadvantages

* Requires discipline to avoid placing business logic in `core`.
* Adds one additional application to the project.

---

# Consequences

## Positive

* Cleaner architecture.
* Reduced code duplication.
* Consistent shared functionality.
* Easier maintenance.
* Improved scalability.

## Negative

* Developers must clearly distinguish between shared utilities and business logic.
* Poor organization of the `core` app could lead to it becoming a "catch-all" module if not managed carefully.

---

# Impact on Future Development

The `core` application should contain only reusable infrastructure and shared functionality.

Business-specific logic must always remain within its respective application (such as `users`, `posts`, or `comments`).

Maintaining this separation will help preserve a modular, scalable, and maintainable architecture throughout the project's lifecycle.
