# Database Design

# Database Overview

The Blog Platform uses **PostgreSQL** as the primary relational database for both development and production environments.

Using the same database engine across all environments eliminates environment-specific issues and ensures consistent behavior during development, testing, and deployment.

---

# Database Engine

**PostgreSQL**

### Why PostgreSQL?

* Production-ready relational database
* Excellent performance
* ACID compliance
* Strong data integrity
* Advanced indexing
* JSON support
* Excellent Django integration
* Widely used in enterprise applications

---

# Database Name

```text
blog_platform
```

---

# Database Strategy

The project follows these database principles:

* PostgreSQL for development and production
* Django ORM for all database operations
* Database normalization
* Foreign key relationships
* Backend-enforced integrity
* Incremental schema evolution through migrations

---

# Current Database Schema (Feature 02)

At the completion of **Feature 02**, the database contains a single business entity:

```text
User
```

Additional entities will be introduced incrementally as new features are completed.

---

# Current Entity Relationship Diagram

```text
┌───────────────────────────────┐
│             User              │
├───────────────────────────────┤
│ id                            │
│ username                      │
│ first_name                    │
│ last_name                     │
│ email                         │
│ password                      │
│ is_staff                      │
│ is_superuser                  │
│ is_active                     │
│ date_joined                   │
└───────────────────────────────┘
```

---

# User Entity

## Model

```text
User
```

## Base Class

```text
AbstractUser
```

The project uses Django's `AbstractUser` as the foundation for the custom user model.

This preserves Django's authentication system while allowing future customization without requiring complex database migrations.

---

## Current Fields

Inherited from `AbstractUser`:

* id
* username
* first_name
* last_name
* email
* password
* is_active
* is_staff
* is_superuser
* last_login
* date_joined

No custom database fields have been added yet. This feature establishes the architectural foundation for future enhancements.

---

# Current Relationships

At this stage:

```text
User
```

No foreign key or one-to-one relationships have been introduced yet.

---

# Planned Relationships

As additional features are implemented, the User model will become the central entity for multiple relationships.

```text
User
├── Posts (One-to-Many)
├── Comments (One-to-Many)
├── Profile (One-to-One)
├── Bookmarks (Many-to-Many)
└── Likes (Many-to-Many)
```

These relationships are planned and will be implemented in future features.

---

# Future Planned Tables

The following database tables are planned:

* Users
* Profiles
* Posts
* Categories
* Tags
* Comments
* Bookmarks
* Likes

Each table will be introduced only when its corresponding feature is implemented.

---

# Migration Strategy

The project follows a migration-first approach.

## Current Status

* Custom User model implemented before the first migration.
* `AUTH_USER_MODEL` configured successfully.
* Database schema prepared for future authentication features.

This avoids one of the most common architectural mistakes in Django projects—changing the user model after migrations have already been created.

---

# Database Design Principles

The project follows these principles:

* Normalized database design
* Primary and foreign key constraints
* Incremental migrations
* Meaningful relationship naming
* Backend ownership enforcement
* No duplicated business data
* ORM-based database access only

---

# Indexing Strategy

Current:

* Primary key index on `id`
* Default indexes provided by Django

Future:

* Username index optimization
* Email lookup optimization
* Slug indexes
* Composite indexes where appropriate

Indexes will be added only when justified by application requirements.

---

# Data Integrity

Data integrity is maintained through:

* Django ORM
* Database constraints
* Model validation
* Migration history
* Backend validation
* Authentication and permission checks

The frontend is never responsible for enforcing database integrity.

---

# Current Project Status

## Completed

* ✅ Feature 01 — Project Foundation & Architecture
* ✅ Feature 02 — Custom User Model & User App Architecture

## Current Database Version

Initial schema with a custom User model foundation.

## Next Planned Database Changes

Feature 03 will introduce the authentication foundation while continuing to use the existing custom User model without requiring schema redesign.
