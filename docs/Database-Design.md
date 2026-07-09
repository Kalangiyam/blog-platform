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

# Current Database Schema (Feature 06)

At the completion of Feature 06, the database contains three primary business entities:

- User
- Post
- Category

Feature 05 introduced the publishing workflow by utilizing the existing `status` and `published_at` fields of the `Post` model without requiring schema changes.

Feature 06 introduces the `Category` entity as the platform's first reusable taxonomy domain. Categories are designed to support future relationships with Posts while remaining independently manageable.

The Post entity introduces the application's first business domain and establishes the foundation for future content management features.

Shared abstract base models provide reusable functionality for:

- Timestamp tracking
- Audit fields
- Soft deletion

Future entities will reuse these base models to maintain consistency across the project.

---

# Current Entity Relationship Diagram

```text
┌───────────────────────────────┐
│             User              │
├───────────────────────────────┤
│ id                            │
│ username                      │
│ first_name                    │            1
│ last_name                     │───────────────────────┐
│ email                         │                       |                               
│ password                      │                       |    
│ is_staff                      │                       |
│ is_superuser                  │                       |
│ is_active                     │                       |
│ date_joined                   │                       |
└───────────────────────────────┘                       │
                                                        │
                                                        │
                                                        ▼
                                            ┌──────────────────────┐
                                            │         Post         │
                                            ├──────────────────────┤
                                            │ id                   │
                                            │ title                │
                                            │ slug                 │
                                            │ excerpt              │
                                            │ content              │
                                            │ status               │
                                            │ published_at         │
                                            │ author_id (FK)       │
                                            │ created_by_id (FK)   │
                                            │ updated_by_id (FK)   │
                                            │ deleted_by_id (FK)   │
                                            │ created_at           │
                                            │ updated_at           │
                                            │ is_deleted           │
                                            │ deleted_at           │
                                            └──────────────────────┘
                ┌───────────────────────────────┐
                │           Category            │
                ├───────────────────────────────┤
                │ id                            │
                │ name                          │
                │ slug                          │
                │ is_active                     │
                │ created_by_id                 │
                │ updated_by_id                 │
                │ created_at                    │
                │ updated_at                    │
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

# Post Entity

## Model

```text
Post
```

## Responsibilities

The Post model represents blog content created by authenticated users.

Current capabilities include:

- Draft creation
- Slug generation
- Public publishing
- Author ownership
- Audit tracking
- Soft deletion

## Relationships

| Relationship | Target | Type |
|--------------|--------|------|
| author | User | ForeignKey |
| created_by | User | ForeignKey |
| updated_by | User | ForeignKey |
| deleted_by | User | ForeignKey |

## Important Fields

- title
- slug
- excerpt
- content
- status
- published_at
- created_at
- updated_at
- is_deleted
- deleted_at

---

# Category Entity

## Model

```text
Category
```

## Responsibilities

The Category model provides reusable taxonomy for organizing blog posts.

Current capabilities include:

- Unique category names
- Automatic slug generation
- Active status management
- Audit tracking
- Public category browsing
- Staff-managed administration

## Relationships

| Relationship | Target | Type |
|--------------|--------|------|
| created_by | User | ForeignKey |
| updated_by | User | ForeignKey |

> A many-to-many relationship between `Post` and `Category` is planned for a future feature.

---

# Current Relationships

At this stage:

```text
User
├── Post (One-to-Many)
└── Category (One-to-Many via audit fields)
```

A single user can author multiple posts.

Each post belongs to exactly one author.

The direct relationship between Posts and Categories has intentionally been deferred until the post categorization feature is implemented.

---

# Planned Relationships

As additional features are implemented, the User model will become the central entity for multiple relationships.

```text
User
├── Posts (One-to-Many) (Implemented)
├── Comments (One-to-Many)
├── Profile (One-to-One)
├── Bookmarks (Many-to-Many)
└── Likes (Many-to-Many)
```
```text
Post
└── Categories (Many-to-Many)
```

These relationships are planned and will be implemented in future features.

---

# Future Planned Tables

The following database tables are planned:

* ✅ Users
* Profiles
* ✅ Posts 
* ✅ Categories
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
* Database schema successfully supports JWT authentication  without requiring additional database tables or modifications to the custom User model.
* Authentication functionality has been implemented while preserving the existing schema.
* Posts application successfully introduced through incremental migrations.
* Foreign key relationships established between `User` and `Post`.
* Shared abstract base models reused for audit fields, timestamps, and soft deletion.
* Database schema supports ownership tracking and the implemented publishing workflow without requiring additional schema changes.
* Categories application introduced through incremental migrations.
* Unique constraints established for category names and slugs.
* Active status management implemented for reusable taxonomy records.

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
* Slug-based resource identification
* Soft deletion instead of physical deletion
* Audit trail for data changes
* Reusable abstract base models
* Reusable taxonomy entities
* Stable slug identifiers
* Independent domain modules

---

# Indexing Strategy

Current:

* Primary key index on `id`
* Default indexes provided by Django
* Indexed unique slug for post lookup
* Indexed unique slug for category lookup
* Indexed unique category name
* Index on `is_active` for category filtering (if implemented)

Future:

- Composite indexes
- Full-text search indexes (when search functionality is introduced)

Indexes will be added only when justified by application requirements.

---

# Data Integrity

Data integrity is maintained through:

* Django ORM
* Database constraints
* Model validation
* Migration history
* Backend validation
* JWT authentication
* Authentication and permission checks
* Object-level permission enforcement
* Soft-delete protection
* Ownership validation
* Backend validation of publishing state transitions
* Automatic management of publication timestamps
* Unique category name enforcement
* Automatic backend slug generation
* Active category filtering through the default manager

The frontend is never responsible for enforcing database integrity.

---

# Current Project Status

## Completed

* ✅ Feature 01 — Project Foundation & Architecture
* ✅ Feature 02 — Custom User Model & User App Architecture
* ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs
* ✅ Feature 04 — Posts Domain Architecture & Database Design
* ✅ Feature 05 — Publishing Workflow
* ✅ Feature 06 — Categories

## Current Database Version
Current schema includes:

- Custom User model
- Post model
- Audit tracking
- Publication status management
- Publication timestamp tracking
- Timestamp tracking
- Soft deletion
- User–Post relationships
- Category model
- Active status management
- Category audit tracking
- Slug-based category identification

The publishing workflow introduced in Feature 05 continues to operate entirely through application logic, reusing the existing `Post` schema.

Feature 06 extends the database by introducing the `Category` entity, providing a reusable taxonomy model with unique names, slug-based identification, active status management, and audit tracking. The relationship between Posts and Categories is intentionally deferred to a future feature to allow the taxonomy domain to evolve independently.

## Shared Abstract Models

The project uses reusable abstract base models to avoid duplicated code.

| Base Model        | Responsibility                     |
| ----------------- | ---------------------------------- |
| TimeStampedModel  | created_at, updated_at             |
| AuditModel        | created_by, updated_by             |
| SoftDeleteModel   | is_deleted, deleted_at, deleted_by |
| ActiveStatusModel | is_active                          |


All future business entities should inherit from these models where appropriate to ensure consistent auditing, lifecycle management, and maintainability.

## Next Planned Database Changes

Feature 07 will introduce Tags as another reusable taxonomy entity.

Future database enhancements may include:

* Tags
* Post–Category many-to-many relationship
* Post–Tag many-to-many relationship
* Comment relationships
* Profile relationships
* Bookmarks
* Likes
