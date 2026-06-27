# ADR-004: Apps Directory

* **Status:** Accepted
* **Date:** 2026-06-25
* **Author:** Kalangiyam

---

# Context

As the Blog Platform grows, the number of Django applications will increase. Organizing all applications directly under the project root can make the directory structure cluttered and harder to navigate.

A dedicated location for business applications is needed to improve organization, maintainability, and scalability.

---

# Decision

All Django applications will be stored inside a dedicated `apps/` directory within the backend project.

```text
backend/
│
├── apps/
│   ├── core/
│   ├── users/
│   ├── posts/
│   ├── comments/
│   ├── categories/
│   └── ...
│
├── config/
├── requirements/
└── manage.py
```

The `apps/` directory serves as the central location for all business-domain applications.

---

# Rationale

Grouping all Django applications under a single directory creates a cleaner and more organized project structure.

Key benefits include:

* Clear separation between project configuration and business logic.
* Easier navigation as the number of applications grows.
* Consistent organization across the project.
* Improved maintainability.
* Better scalability for future features.

This approach is commonly used in medium and large Django projects.

---

# Alternatives Considered

## Option 1 — Applications in the Project Root

Example:

```text
backend/
├── users/
├── posts/
├── comments/
├── config/
└── manage.py
```

### Advantages

* Simpler for very small projects.
* Slightly fewer directories.

### Disadvantages

* Project root becomes cluttered.
* Harder to distinguish business applications from project configuration.
* Less scalable as the application grows.

---

## Option 2 — Dedicated `apps/` Directory (Selected)

Example:

```text
backend/
├── apps/
│   ├── users/
│   ├── posts/
│   ├── comments/
│   └── ...
```

### Advantages

* Cleaner project structure.
* Better separation of concerns.
* Easier navigation.
* Supports modular application design.
* Scales well with additional features.

### Disadvantages

* One additional directory level.
* Slightly longer import paths in some cases.

---

# Consequences

## Positive

* Cleaner backend organization.
* Better maintainability.
* Consistent application structure.
* Easier onboarding for future contributors.
* Supports long-term project growth.

## Negative

* Slightly deeper directory hierarchy.
* Requires configuring Django to recognize applications within the `apps/` package.

---

# Impact on Future Development

Every new business feature should be implemented as a separate Django application inside the `backend/apps/` directory.

Examples include:

* `users`
* `posts`
* `comments`
* `categories`
* `tags`
* `profiles`

This approach keeps the project modular and ensures that business logic remains organized as the application evolves.
