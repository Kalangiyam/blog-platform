# ADR-003 PostgreSQL

## Context

The application targets production-grade deployment.

## Decision

Use PostgreSQL for development and production.

## Alternatives Considered

SQLite

## Consequences

Advantages:

* Better concurrency
* Better indexing
* Production readiness

Disadvantages:

* Additional setup complexity
