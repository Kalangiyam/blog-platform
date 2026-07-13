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

# Current Database Schema (Feature 08)

At the completion of Feature 07, the database contains four primary business entities:

- User
- Post
- Category
- Tag

Feature 05 introduced the publishing workflow by utilizing the existing `status` and `published_at` fields of the `Post` model without requiring schema changes.

Feature 06 introduced the `Category` entity as the platform's first reusable taxonomy domain.

Feature 07 introduced the Tag entity as the platform's second reusable taxonomy domain.

Feature 08 introduces the first taxonomy relationship by associating Posts and Categories through a many-to-many relationship.

Categories remain independently manageable while now supporting reusable assignment across multiple posts.

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
│ first_name                    │
│ last_name                     │
│ email                         │
│ password                      │
│ is_staff                      │
│ is_superuser                  │
│ is_active                     │
│ date_joined                   │
└───────────────────────────────┘
                │
                │ 1
                │
                ▼
┌───────────────────────────────┐
│             Post              │
├───────────────────────────────┤
│ id                            │
│ title                         │
│ slug                          │
│ excerpt                       │
│ content                       │
│ status                        │
│ published_at                  │
│ author_id (FK)                │
│ created_by_id (FK)            │
│ updated_by_id (FK)            │
│ deleted_by_id (FK)            │
│ created_at                    │
│ updated_at                    │
│ is_deleted                    │
│ deleted_at                    │
└───────────────────────────────┘
                │
                │ M
                │
                ▼
┌───────────────────────────────┐
│       Post_Category           │
├───────────────────────────────┤
│ id                            │
│ post_id (FK)                  │
│ category_id (FK)              │
└───────────────────────────────┘
                ▲
                │
                │ M
                │
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


┌───────────────────────────────┐
│             Tag               │
├───────────────────────────────┤
│ id                            │
│ name                          │
│ slug                          │
│ description                   │
│ is_active                     │
│ created_by_id                 │
│ updated_by_id                 │
│ created_at                    │
│ updated_at                    │
└───────────────────────────────┘
```
```text
Post
├── categories (ManyToMany)
```
```text
PostCategory (Auto-generated Join Table)
├── post_id
└── category_id
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
| categories | Category | ManyToMany |

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
| posts | Post | ManyToMany (Reverse) |

Feature 08 introduces a many-to-many relationship between Posts and Categories.

A category may be assigned to multiple posts, and a post may belong to multiple categories.

---

# Tag Entity

## Model

```text
Tag
```

## Responsibilities

The Tag model provides reusable taxonomy for classifying blog posts.

Current capabilities include:

- Unique tag names
- Automatic slug generation
- Active status management
- Audit tracking
- Public tag browsing
- Staff-managed administration

## Relationships

| Relationship | Target | Type |
|--------------|--------|------|
| created_by | User | ForeignKey |
| updated_by | User | ForeignKey |

> A many-to-many relationship between `Post` and `Tag` is planned for a future feature.

---

# Current Relationships

```text
User
├── Post (One-to-Many)
├── Category (One-to-Many via audit fields)
└── Tag (One-to-Many via audit fields)

Post
├── Author (ForeignKey → User)
└── Categories (Many-to-Many)

Category
└── Posts (Reverse Many-to-Many)
```

Implemented relationships:

- User → Post
- Post → Category
- Category → Post (reverse)

The Post–Tag relationship remains deferred until Feature 09.
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
├── Categories (Many-to-Many) ✅ Implemented
└── Tags (Many-to-Many) Planned
```

These relationships are planned and will be implemented in future features.

---

# Future Planned Tables

The following database tables are planned:

* ✅ Users
* Profiles
* ✅ Posts 
* ✅ Categories
* ✅Tags
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
* Tags application introduced through incremental migrations.
* Unique constraints established for tag names and slugs.
* Active status management implemented for reusable tag records.
* Feature 08 introduced a many-to-many relationship between Posts and Categories.
* Django automatically generated the intermediate relationship table.
* Category assignment is enforced through backend validation and ORM relationship management.

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
* Independent taxonomy domains
* Stable slug identifiers
* Independent domain modules
* Many-to-many taxonomy relationships
* Reusable category assignment
* Slug-based relationship management
* Normalized relationship tables

---

# Indexing Strategy

Current:

* Primary key index on `id`
* Default indexes provided by Django
* Indexed unique slug for post lookup
* Indexed unique slug for category lookup
* Indexed unique category name
* Index on `is_active` for category filtering (if implemented)
* Indexed unique slug for tag lookup
* Indexed unique tag name
* Index on `is_active` for tag filtering (if implemented)
* Automatic indexes on the Post–Category intermediate relationship table
* Optimized category retrieval using `prefetch_related()`

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
* Unique tag name enforcement
* Automatic backend slug generation for tags
* Active tag filtering through the default manager
* Validation of category relationships before persistence
* Prevention of duplicate category assignments
* Active category enforcement during assignment
* ORM-managed many-to-many integrity

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
* ✅ Feature 07 — Tags
* ✅ Feature 08 — Post–Category Relationship

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
- Tag model
- Tag audit tracking
- Active tag management
- Slug-based tag identification
- Post–Category many-to-many relationship
- Category relationship management
- Nested category retrieval support

The publishing workflow introduced in Feature 05 continues to operate entirely through application logic, reusing the existing `Post` schema.

Feature 06 introduced the Category entity as the platform's first reusable taxonomy model.

Feature 07 introduces the Tag entity as the second reusable taxonomy model. Categories and Tags are currently independent business domains with unique names, stable slugs, active status management, and audit tracking. 

Feature 08 introduces the Post–Category relationship as the first implemented taxonomy integration.

Posts may now belong to multiple categories while categories remain independently managed and reusable.

The Post–Tag relationship remains planned for Feature 09.

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

Feature 09 will introduce the Post–Tag many-to-many relationship.

Future database enhancements may include:

* Post–Tag many-to-many relationship
* Comment relationships
* Profile relationships
* Bookmarks
* Likes