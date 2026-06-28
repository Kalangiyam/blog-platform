# ADR-002: Settings Architecture

* **Status:** Accepted
* **Date:** 2026-06-25
* **Author:** Kalangiyam

---

# Context

As Django projects grow, a single `settings.py` file becomes increasingly difficult to maintain. Mixing development, production, and future environment configurations in one file reduces readability, increases the risk of configuration mistakes, and makes long-term maintenance more difficult.

To support a production-grade application, the project requires a modular settings architecture that separates shared configuration from environment-specific settings.

---

# Decision

The project adopts a modular settings structure.

```text
config/
└── settings/
    ├── __init__.py
    ├── base.py
    ├── development.py
    └── production.py
```

## File Responsibilities

### `base.py`

Contains configuration shared across all environments, including:

* Installed applications
* Middleware
* Templates
* Internationalization
* Static and media configuration
* Default database configuration
* Shared project settings

### `development.py`

Contains development-only configuration, including:

* Debug mode
* Local database settings
* Development tools
* Development logging

### `production.py`

Contains production-only configuration, including:

* Production database settings
* Security settings
* HTTPS configuration
* Secure cookies
* Allowed hosts
* Performance optimizations

---

# Rationale

Separating settings by environment provides a cleaner and more maintainable project structure.

Key benefits include:

* Clear separation of shared and environment-specific configuration.
* Reduced risk of deploying development settings to production.
* Improved readability and maintainability.
* Easier addition of new environments (such as staging or testing).
* Alignment with Django best practices for medium and large projects.

---

# Alternatives Considered

## Option 1 — Single `settings.py`

### Advantages

* Simpler project setup.
* Easy to understand for small projects.
* Fewer configuration files.

### Disadvantages

* Difficult to maintain as the project grows.
* Development and production settings become mixed.
* Higher risk of configuration mistakes.
* Less scalable.

---

## Option 2 — Modular Settings (Selected)

### Advantages

* Better organization.
* Environment isolation.
* Improved security.
* Easier maintenance.
* Scales well as the application grows.

### Disadvantages

* Slightly more initial configuration.
* Developers must specify the correct settings module when running the project.

---

# Consequences

## Positive

* Cleaner project organization.
* Better separation of environments.
* Easier long-term maintenance.
* Improved deployment reliability.
* Supports production-ready configuration management.

## Negative

* Slightly more complex project setup.
* Additional configuration files to maintain.
* New contributors must understand the settings hierarchy.

---

# Impact on Future Development

All future configuration changes should follow this structure:

* Shared configuration belongs in `base.py`.
* Development-specific configuration belongs in `development.py`.
* Production-specific configuration belongs in `production.py`.

Future environments (such as `staging.py` or `testing.py`) can be added without restructuring the existing configuration, ensuring the project remains organized and scalable as it evolves.
