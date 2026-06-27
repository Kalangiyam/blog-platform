# ADR-001: Project Structure

* **Status:** Accepted
* **Date:** 2026-06-25
* **Author:** Kalangiyam

---

# Context

The Blog Platform is designed as a **production-grade, API-first application**. The frontend and backend have different responsibilities, technologies, deployment processes, and development workflows.

A clear project structure is required to:

* Separate frontend and backend concerns.
* Improve maintainability.
* Support independent development and deployment.
* Keep project documentation centralized.
* Allow the project to scale as new features are added.

---

# Decision

The project adopts the following top-level directory structure:

```text
blog-platform/
│
├── frontend/
├── backend/
└── docs/
```

## Directory Responsibilities

### frontend/

Contains the React application, including:

* User Interface
* Routing
* State Management
* API Integration
* Client-side assets

### backend/

Contains the Django application, including:

* Project configuration
* Business applications
* REST APIs
* Authentication
* Database models
* Business logic

### docs/

Contains all project documentation, including:

* Architecture
* Database Design
* Authentication Flow
* API Specification
* Testing Strategy
* Architecture Decision Records (ADRs)

---

# Rationale

This structure provides clear separation between application layers and supports long-term maintainability.

Key benefits include:

* Independent frontend and backend development.
* Independent deployment pipelines.
* Clear separation of responsibilities.
* Easier project navigation.
* Better scalability.
* Alignment with modern API-first architecture.

---

# Alternatives Considered

## Option 1 — Monolithic Django Application

### Advantages

* Simpler initial setup.
* Fewer project directories.
* Suitable for very small applications.

### Disadvantages

* Tight coupling between frontend and backend.
* Limited scalability.
* Less flexibility for future clients (mobile, desktop, etc.).
* Not aligned with the project's architecture goals.

---

## Option 2 — API-First Architecture (Selected)

### Advantages

* Complete separation of concerns.
* Independent technology stacks.
* Better scalability.
* Easier maintenance.
* Supports multiple frontend clients.

### Disadvantages

* Additional API layer.
* Slightly more complex initial setup.
* Authentication must be handled through APIs.

---

# Consequences

## Positive

* Modular architecture.
* Easier maintenance.
* Independent deployments.
* Better scalability.
* Clear project organization.

## Negative

* Higher initial complexity.
* More components to configure.
* Requires API communication between frontend and backend.

---

# Impact on Future Development

This decision establishes the architectural foundation for the entire project.

All future features must preserve the separation between:

* Frontend presentation
* Backend business logic
* Database persistence
* Project documentation

Any future architectural changes should build upon this structure rather than replacing it.
