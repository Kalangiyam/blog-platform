# ADR-002 Settings Architecture

## Context

Single settings.py files become difficult to maintain as projects grow.

## Decision

Use:

config/settings/
├── base.py
├── development.py
└── production.py

## Alternatives Considered

Single settings.py file.

## Consequences

Advantages:

* Environment separation
* Better maintainability
* Improved security

Disadvantages:

* Slightly more complex startup configuration
