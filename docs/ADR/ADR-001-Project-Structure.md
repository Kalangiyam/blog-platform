# ADR-001 Project Structure

## Context

The project requires clear separation between frontend and backend concerns.

## Decision

Use:

blog-platform/
├── frontend/
├── backend/
└── docs/

## Alternatives Considered

Monolithic Django templates architecture.

## Consequences

Advantages:

* Independent frontend deployment
* Independent backend deployment
* Clear separation of concerns

Disadvantages:

* Additional API layer complexity
