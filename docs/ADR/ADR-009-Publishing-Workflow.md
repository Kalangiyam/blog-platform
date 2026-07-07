# ADR-009 — Publishing Workflow

## Status

* **Status:** Accepted
* **Date:** 2026-07-07
* **Feature:** Feature 05 — Publishing Workflow

---

# Context

Feature 05 extends the Posts domain by introducing the publishing lifecycle.

Publishing is a business workflow rather than a standard CRUD operation. The application must enforce valid status transitions, manage publication timestamps automatically, and ensure that only the post author can perform publishing actions.

The architecture should also remain flexible enough to support future editorial workflows involving editors and administrators.

---

# Decision

The publishing workflow follows these architectural decisions:

## Custom ViewSet Actions

Publishing operations are implemented using custom ViewSet actions:

* `publish`
* `unpublish`

Benefits:

* Clearly represents business workflows
* Keeps CRUD operations separate from domain-specific actions
* Provides explicit and self-documenting API endpoints
* Simplifies future workflow extensions

---

## Workflow-Specific Serializers

Dedicated serializers are used for publishing operations:

* `PostPublishSerializer`
* `PostUnpublishSerializer`

Benefits:

* Single Responsibility Principle
* Encapsulates workflow-specific validation
* Keeps CRUD serializers focused on data manipulation
* Improves maintainability and readability

---

## Backend Workflow Validation

Publishing rules are enforced entirely on the backend.

Implemented validations include:

* Draft → Published
* Published → Draft

Invalid state transitions are rejected before any database update occurs.

Benefits:

* Prevents invalid workflow states
* Ensures consistent business logic
* Protects against client-side manipulation

---

## Automatic Publication Timestamp Management

The backend manages the `published_at` field automatically.

Publishing:

* Sets `published_at` to the current timestamp.

Unpublishing:

* Clears `published_at`.

Benefits:

* Consistent publication metadata
* Prevents client-controlled timestamps
* Improves data integrity

---

## Existing Permission Reuse

Publishing actions reuse the existing authentication and object-level permission architecture.

Implemented permissions:

* JWT authentication
* `IsPostAuthor` object-level permission

Benefits:

* Consistent authorization model
* No duplicated permission logic
* Easy extension for future editor and administrator roles

---

# Consequences

Positive:

* Clear separation between CRUD operations and business workflows
* Strong backend enforcement of publishing rules
* Improved maintainability
* Scalable architecture for future editorial features
* Consistent permission model

Trade-offs:

* Additional serializers to maintain
* Additional ViewSet actions
* Slight increase in implementation complexity

These trade-offs are acceptable because they preserve a clean architecture and support future workflow expansion.

---

# Related Features

* Feature 04 — Posts Domain Architecture & Database Design
* Feature 05 — Publishing Workflow
* Feature 06 — Categories (planned)
* Feature 07 — Tags (planned)
* Future Editorial Workflow (planned)