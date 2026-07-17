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

# Current Database Schema (Feature 11)

At the completion of Feature 11, the database contains six primary entities:

* User
* Profile
* Post
* Category
* Tag
* Comment


Feature 05 introduced the publishing workflow by utilizing the existing `status` and `published_at` fields of the `Post` model without requiring schema changes.

Feature 06 introduced the `Category` entity as the platform's first reusable taxonomy domain.

Feature 07 introduced the Tag entity as the platform's second reusable taxonomy domain.

Feature 08 introduces the first taxonomy relationship by associating Posts and Categories through a many-to-many relationship.

Feature 09 extends the taxonomy architecture by associating Posts and Tags through a second many-to-many relationship.

Feature 10 introduces the Comment entity as the platform's second user-generated business entity after Posts.

Comments establish:

- A one-to-many relationship from Post to Comment
- A one-to-many relationship from User to Comment
- Author ownership
- Audit tracking
- Soft deletion

Categories remain independently manageable while now supporting reusable assignment across multiple posts.

The Post entity introduces the application's first business domain and establishes the foundation for future content management features.

Shared abstract base models provide reusable functionality for:

- Timestamp tracking
- Audit fields
- Soft deletion
- Active-status management

Feature 11 introduces the Profile entity as a one-to-one extension of the custom User model.
Profiles establish:
- A one-to-one relationship from User to Profile
- Dedicated storage for user-facing profile information 
- Automatic Profile creation for newly created Users
- A data migration that backfills Profiles for existing Users
- Timestamp tracking through `TimeStampedModel`

The Profile entity inherits only from `TimeStampedModel` because its lifecycle is directly tied to the owning User and it does not require independent audit, soft-delete, or active-status behavior.

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

```text
┌───────────────────────────────┐
│            Comment            │
├───────────────────────────────┤
│ id                            │
│ post_id (FK)                  │
│ author_id (FK)                │
│ content                       │
│ created_by_id (FK)            │
│ updated_by_id (FK)            │
│ deleted_by_id (FK)            │
│ created_at                    │
│ updated_at                    │
│ is_deleted                    │
│ deleted_at                    │
└───────────────────────────────┘

┌───────────────────────────────┐ │ Profile │ ├───────────────────────────────┤ │ id │ │ user_id (FK, UNIQUE) │ │ bio │ │ website │ │ location │ │ date_of_birth │ │ created_at │ │ updated_at │ └───────────────────────────────┘
```

Relationship summary:

```text
User
 ├── Posts
 └── Comments

Profile
 └── User

Post
 ├── Categories
 ├── Tags
 └── Comments

Comment
 ├── Post
 └── Author
```


```text
Post
├── categories (ManyToMany)
├── tags (ManyToMany)
```
```text
PostCategory (Auto-generated Join Table)
├── post_id
└── category_id
```
```text
PostTag (Auto-generated Join Table)
├── post_id
└── tag_id
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

# Profile Entity

## Model

```text
Profile
```

## Responsibilities

The Profile model stores user-facing profile information separately from authentication and authorization data.

Current capabilities include:

* User biography
* Personal website
* Location
* Date of birth
* Automatic Profile creation for new Users
* Existing User Profile backfill
* Public and private Profile representations
* Timestamp tracking

## Relationships

| Relationship | Target | Type          | Deletion Behavior |
| ------------ | ------ | ------------- | ----------------- |
| user         | User   | OneToOneField | CASCADE           |

## Important Fields

* `user`
* `bio`
* `website`
* `location`
* `date_of_birth`
* `created_at`
* `updated_at`

## Lifecycle

The Profile lifecycle is directly tied to the User lifecycle.

```text
User Created
     │
     ▼
Profile Created
```

```text
User Physically Deleted
     │
     ▼
Profile Physically Deleted
```

The Profile model inherits only from:

```text
TimeStampedModel
```

Profiles do not use soft deletion because they have no independent lifecycle outside the owning User.

## One-to-One Constraint

The `OneToOneField` creates a database-level uniqueness constraint on `user_id`.

This guarantees:

```text
One User → One Profile
One Profile → One User
```

## Optional Fields

The following fields are optional:

* `bio`
* `website`
* `location`
* `date_of_birth`

Text-based optional fields store empty strings when omitted.

A missing `date_of_birth` is stored as `NULL`.

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
| tags | Tag | ManyToMany |

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
| posts | Post | ManyToMany (Reverse) |

Feature 09 introduces a many-to-many relationship between Posts and Tags.

A tag may be assigned to multiple posts, and a post may contain multiple tags.

---

# Comment Entity

## Model

```text
Comment
```

## Responsibilities

The Comment model represents user-generated discussion attached to published Posts.

Current capabilities include:

* Comment creation
* Comment ownership
* Post association
* Audit tracking
* Soft deletion
* Author-owned updates
* Author-owned deletion
* Public retrieval through published Posts

## Relationships

| Relationship | Target | Type       | Deletion Behavior           |
| ------------ | ------ | ---------- | --------------------------- |
| post         | Post   | ForeignKey | CASCADE                     |
| author       | User   | ForeignKey | PROTECT                     |
| created_by   | User   | ForeignKey | Shared audit behavior       |
| updated_by   | User   | ForeignKey | Shared audit behavior       |
| deleted_by   | User   | ForeignKey | Shared soft-delete behavior |

## Important Fields

* `post`
* `author`
* `content`
* `created_at`
* `updated_at`
* `created_by`
* `updated_by`
* `is_deleted`
* `deleted_at`
* `deleted_by`

## Lifecycle

Comments are business entities and inherit:

```text
TimeStampedModel
AuditModel
SoftDeleteModel
```

Normal queries exclude soft-deleted Comments, while unrestricted administrative queries may access them through the shared all-records manager.

## Ordering

Comments use deterministic chronological ordering:

```python
ordering = ("created_at", "id")
```

This supports readable flat discussions and stable result ordering.

## Content Constraint

Comment content is limited to 2,000 characters at the model and serializer layers.

Whitespace-only Comment content is rejected by API validation.

---

# Current Relationships

```text
User
├── Profile (One-to-One)
├── Posts (One-to-Many)
├── Comments (One-to-Many)
├── Category audit relationships
└── Tag audit relationships

Profile
└── User (One-to-One)

Post
├── Author (ForeignKey → User)
├── Categories (Many-to-Many)
├── Tags (Many-to-Many)
└── Comments (One-to-Many)

Category
└── Posts (Reverse Many-to-Many)

Tag
└── Posts (Reverse Many-to-Many)

Comment
├── Post (ForeignKey → Post)
└── Author (ForeignKey → User)
```

Implemented relationships:

* User → Profile
* Profile → User
* User → Post
* User → Comment
* Post → Category
* Category → Post
* Post → Tag
* Tag → Post
* Post → Comment
* Comment → Post
* Comment → User

The platform now contains:

* One one-to-one User-extension relationship
* Two reusable taxonomy relationships
* Two user-generated business entities
* One Post-to-Comment parent-child relationship

---

# Planned Relationships

As additional features are implemented, the User model will become the central entity for multiple relationships.

```text
User
├── Profile (One-to-One) ✅ Implemented
├── Posts (One-to-Many) ✅ Implemented
├── Comments (One-to-Many) ✅ Implemented
├── Bookmarks (Many-to-Many)
└── Likes (Many-to-Many)
```

```text
Post
├── Categories (Many-to-Many) ✅ Implemented
├── Tags (Many-to-Many) ✅ Implemented
└── Comments (One-to-Many) ✅ Implemented
```

Implemented relationships are marked above. Remaining relationships will be introduced only when their corresponding features are developed.

---

# Future Planned Tables

The following database tables are planned:

* ✅ Users
* ✅ Profiles
* ✅ Posts 
* ✅ Categories
* ✅ Tags
* ✅ Comments
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
* Feature 09 introduced a many-to-many relationship between Posts and Tags.
* Django automatically generated the second taxonomy relationship table.
* Tag assignment is enforced through backend validation and ORM relationship management.
* Shared taxonomy validation is implemented through serializer mixins.
* Feature 10 introduced the `Comment` table through `comments.0001_initial`.
* Foreign-key relationships were created from Comment to Post and User.
* Post physical deletion uses `CASCADE`.
* User physical deletion is prevented through `PROTECT` while authored Comments exist.
* Comment timestamp, audit, and soft-delete fields were inherited from shared abstract models.
* No data migration was required because the Comment table was newly introduced.
* Feature 11 introduced the `Profile` table through `profiles.0001_initial`.
* The Profile table includes a unique one-to-one relationship with the custom User model.
* Profile physical deletion uses `CASCADE` when the owning User is physically deleted.
* A `post_save` signal automatically creates Profiles for newly created Users.
* A dedicated data migration backfilled missing Profiles for existing Users.
* The backfill migration avoided duplicate Profile creation.
* Historical migration models were resolved using `apps.get_model()`.
* Existing User and authentication tables did not require schema modification.


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
* Reusable tag assignment
* Shared taxonomy validation
* Consistent taxonomy relationship architecture
* One-to-many parent-child relationships
* Explicit Comment ownership
* Required Post and author relationships
* Protected User relationship for user-generated content preservation
* Soft-delete lifecycle for Comments
* Backend-enforced published-Post validation
* Deterministic Comment ordering
* One-to-one User-extension relationships
* Separation between authentication and Profile data
* Automatic Profile provisioning
* Data migrations for existing records
* Database-enforced one-Profile-per-User constraint
* Profile lifecycle tied to User lifecycle

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
* Optimized tag retrieval using `prefetch_related()`
* Automatic foreign-key index on `Comment.post_id`
* Automatic foreign-key index on `Comment.author_id`
* Optimized Comment author loading using `select_related("author")`
* Optimized individual Comment loading using `select_related("author", "post")`
* Unique index on `Profile.user_id` created by `OneToOneField`
* Optimized Profile and User retrieval using `select_related("user")`


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
* Validation of tag relationships before persistence
* Prevention of duplicate category assignments
* Prevention of duplicate tag assignments
* Active category enforcement during assignment
* Active tag enforcement during assignment
* ORM-managed many-to-many integrity
* Shared taxonomy validation through serializer mixins
* Required Comment-to-Post relationship
* Required Comment-to-User relationship
* `CASCADE` enforcement for physical Post deletion
* `PROTECT` enforcement for physical User deletion
* Backend-controlled Comment author assignment
* Backend-controlled parent Post assignment
* Prevention of Comment author reassignment
* Prevention of Comment Post reassignment
* Published and non-deleted Post validation before Comment creation
* Comment ownership enforcement for updates and deletion
* Soft-deleted Comment exclusion through the default manager
* Comment content length validation
* Whitespace-only Comment rejection
* Required Profile-to-User relationship
* Database uniqueness enforcement for one Profile per User
* Automatic Profile creation for new Users
* Existing User Profile backfill through a data migration
* Prevention of duplicate Profiles
* `CASCADE` enforcement for physical User deletion
* Backend-controlled Profile ownership
* Prevention of Profile owner reassignment through the API
* Future date-of-birth validation
* Public/private Profile data separation

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
* ✅ Feature 09 — Post–Tag Relationship
* ✅ Feature 10 — Comments
* ✅ Feature 11 — User Profiles

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
- Post–Tag many-to-many relationship
- Tag relationship management
- Nested tag retrieval support
- Shared taxonomy validation mixin support
- Comment model
- User–Comment one-to-many relationship
- Post–Comment one-to-many relationship
- Comment ownership
- Comment audit tracking
- Comment soft deletion
- Comment content length limit
- Comment chronological ordering
* Profile model
* User–Profile one-to-one relationship
* Profile timestamp tracking
* Automatic Profile creation for new Users
* Existing User Profile backfill migration
* Profile ownership
* Public and private Profile data support
* Profile query optimization using `select_related()`

The publishing workflow introduced in Feature 05 continues to operate entirely through application logic, reusing the existing `Post` schema.

Feature 06 introduced the Category entity as the platform's first reusable taxonomy model.

Feature 07 introduces the Tag entity as the second reusable taxonomy model. Categories and Tags are currently independent business domains with unique names, stable slugs, active status management, and audit tracking. 

Feature 08 introduces the Post–Category relationship as the first implemented taxonomy integration.

Posts may now belong to multiple categories while categories remain independently managed and reusable.

Feature 09 introduces the Post–Tag relationship as the second implemented taxonomy integration.

Posts may now contain multiple tags while tags remain independently managed and reusable.

Both taxonomy relationships follow the same slug-based assignment architecture and many-to-many database design.

Feature 10 introduces the Comment entity as the second user-generated business entity.

Each Comment belongs to exactly one Post and one User.

Comments use the shared soft-delete lifecycle and audit architecture, preserving records while excluding deleted Comments from normal application queries.

Feature 11 introduces the Profile entity as the platform's first one-to-one User-extension domain.

Each Profile belongs to exactly one User, and each User owns exactly one Profile.

New Profiles are created automatically through a Django `post_save` signal, while a dedicated data migration creates missing Profiles for Users that existed before the feature was introduced.

Profile information remains separated from authentication data, allowing the Profile domain to evolve without modifying the custom User model.

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

Feature 12 will introduce Search.

The initial Search feature may not require a new database table. Expected database considerations include:

* PostgreSQL text-search capabilities
* Searchable Post fields
* Query performance
* Appropriate indexes
* Future full-text search indexes
* Search ranking and filtering strategy

Future database enhancements may also include:

* Media and avatar storage metadata
* Bookmarks
* Likes
* Comment replies
* Comment moderation records
* Advanced search indexes
