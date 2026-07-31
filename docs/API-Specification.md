# API Specification

# API Overview

The Blog Platform follows an **API-First Architecture**, where all communication between the frontend and backend occurs through REST APIs.

At the completion of Feature 14, the platform provides six API modules:

- Authentication APIs
- Posts APIs
- Categories APIs
- Tags APIs
- Comments APIs
- Profiles APIs

Feature 08 extended the Posts API by introducing a many-to-many relationship between Posts and Categories.

Feature 09 extends the same taxonomy architecture by introducing a many-to-many relationship between Posts and Tags. Categories and tags can now be assigned to posts using slug-based write fields, while post responses include lightweight nested category and tag representations.

Feature 10 introduced the Comments domain, Feature 11 introduced Profiles, Feature 12 added public PostgreSQL full-text search, Feature 13 added featured-image management, and Feature 14 introduced role-based authorization.

Authentication is implemented using JWT Authentication with Django REST Framework and Simple JWT.

The Posts module provides the foundation for blog content management, including post creation, retrieval, updating, soft deletion, publishing workflows, category assignment, and tag assignment.

The Categories and Tags modules provide reusable taxonomy management through slug-based endpoints with Editor-controlled administration. Both taxonomy domains are fully integrated with Posts.

Future features will continue extending this document as new API modules are introduced.

---

# API Principles

The project follows these API design principles:

- RESTful API design
- JSON request and response format
- Stateless communication
- Backend validation
- Backend authorization
- Consistent response structure
- Appropriate HTTP status codes
- Version-ready API design
- Slug-based resource identification
- Explicit read and write representations
- Backend-enforced relationship integrity

---

# Base URL

Development:

```text
/api/
```

Future production example:

```text
https://your-domain.com/api/
```

---

# Authentication APIs

## Current Status

Implemented ✅

The authentication module is fully functional and provides registration, login, logout, current-user retrieval, token refresh, and token verification APIs.

| Method | Endpoint                 | Authentication   | Status         |
| ------ | ------------------------ | ---------------- | -------------- |
| POST   | /api/auth/register/      | Public           | ✅ Implemented |
| POST   | /api/auth/login/         | Public           | ✅ Implemented |
| GET    | /api/auth/me/            | JWT Access Token | ✅ Implemented |
| POST   | /api/auth/logout/        | JWT Access Token | ✅ Implemented |
| POST   | /api/auth/token/refresh/ | Refresh Token    | ✅ Implemented |
| POST   | /api/auth/token/verify/  | Public           | ✅ Implemented |

---

## Authentication Request Examples

### Register

POST `/api/auth/register/`

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "StrongPassword@123",
  "password_confirm": "StrongPassword@123"
}
```

---

### Login

POST `/api/auth/login/`

```json
{
  "email": "john@example.com",
  "password": "StrongPassword@123"
}
```

---

### Current User

GET `/api/auth/me/`

Authorization Header:

```text
Authorization: Bearer <access_token>
```

---

### Logout

POST `/api/auth/logout/`

```json
{
  "refresh": "<refresh_token>"
}
```

---

# Posts APIs

## Current Status

Implemented ✅

The Posts module provides blog post management while enforcing authentication, ownership rules, publishing workflow validation, soft deletion, and taxonomy relationship validation.

| Method | Endpoint                     | Authentication                 | Status         |
| ------ | ---------------------------- | ------------------------------ | -------------- |
| POST   | /api/posts/                  | JWT (Author or Editor)         | ✅ Implemented |
| GET    | /api/posts/                  | Public                         | ✅ Implemented |
| GET    | /api/posts/{slug}/           | Public                         | ✅ Implemented |
| PATCH  | /api/posts/{slug}/           | JWT (Owner Author or Editor)   | ✅ Implemented |
| DELETE | /api/posts/{slug}/           | JWT (Owner Author or Editor)   | ✅ Implemented |
| POST   | /api/posts/{slug}/publish/   | JWT (Owner Author or Editor)   | ✅ Implemented |
| POST   | /api/posts/{slug}/unpublish/ | JWT (Owner Author or Editor)   | ✅ Implemented |

## Post Taxonomy Contract

The Posts API uses separate write and read representations for taxonomy relationships.

### Write Fields

```text
category_slugs
tag_slugs
```

These fields accept lists of active taxonomy slugs.

### Read Fields

```text
categories
tags
```

These fields return lightweight nested taxonomy objects containing `name` and `slug`.

This separation keeps requests simple while providing frontend-ready responses.

---

## Create Post

```http
POST /api/posts/
```

### Authentication

JWT Access Token and the Author or Editor role are required.

### Example Request

```json
{
  "title": "Introduction to Django",
  "excerpt": "Learn the fundamentals of Django.",
  "content": "Full article content...",
  "category_slugs": ["backend", "python"],
  "tag_slugs": ["django", "web-development"]
}
```

Both taxonomy fields are optional.

A post may be created with:

- No categories
- No tags
- Categories only
- Tags only
- Both categories and tags

### Successful Response

Status:

```text
201 Created
```

The response includes the created post using the configured post response representation.

---

## List Published Posts

```http
GET /api/posts/
```

### Authentication

Public.

### Behavior

Returns published, non-deleted posts.

Post relationships are optimized using:

```python
select_related("author")
prefetch_related("categories", "tags")
```

This prevents N+1 queries when serializing authors, categories, and tags.

---

## Retrieve Single Post

```http
GET /api/posts/{slug}/
```

### Authentication

Public.

### Behavior

Returns a published, non-deleted post identified by its slug.

---

## Update Post

```http
PATCH /api/posts/{slug}/
```

### Authentication

JWT Access Token required.

### Permission

Authors may update their own posts. Editors may update any active, non-deleted post.

### Example Request

```json
{
  "title": "Updated Django Guide",
  "category_slugs": ["backend", "python"],
  "tag_slugs": ["django", "drf", "api"]
}
```

### Partial Update Semantics

If a taxonomy field is omitted, its existing relationships are preserved.

Example:

```json
{
  "title": "Updated title"
}
```

Result:

```text
Existing categories and tags remain unchanged.
```

If a taxonomy field is supplied as an empty list, its relationships are cleared.

Example:

```json
{
  "tag_slugs": []
}
```

Result:

```text
All tag relationships are removed from the post.
```

If a taxonomy field contains valid slugs, the existing relationships for that taxonomy are replaced.

### Successful Response

Status:

```text
200 OK
```

---

## Example Post Response

```json
{
  "title": "Introduction to Django",
  "slug": "introduction-to-django",
  "status": "published",
  "categories": [
    {
      "name": "Backend",
      "slug": "backend"
    },
    {
      "name": "Python",
      "slug": "python"
    }
  ],
  "tags": [
    {
      "name": "Django",
      "slug": "django"
    },
    {
      "name": "Web Development",
      "slug": "web-development"
    }
  ]
}
```

---

## Delete Post — Soft Delete

```http
DELETE /api/posts/{slug}/
```

### Authentication

JWT Access Token required.

### Permission

Authors may delete their own posts. Editors may delete any active, non-deleted post.

### Behavior

The post remains in the database but is excluded from normal API queries.

### Successful Response

Status:

```text
204 No Content
```

---

## Publish Post

```http
POST /api/posts/{slug}/publish/
```

### Authentication

JWT Access Token required.

### Permission

Authors may publish their own posts. Editors may publish any active, non-deleted post.

### Business Rule

Only a draft post may transition to published.

---

## Unpublish Post

```http
POST /api/posts/{slug}/unpublish/
```

### Authentication

JWT Access Token required.

### Permission

Authors may unpublish their own posts. Editors may unpublish any active, non-deleted post.

### Business Rule

Only a published post may transition to draft.

---

## Post Business Rules

- Only authenticated Authors and Editors can create posts.
- Newly created posts are saved as **Draft**.
- Only **Published** posts are publicly visible.
- Authors can manage only their own posts; Editors can manage any active, non-deleted post.
- A post can only transition from **Draft → Published**.
- A post can only transition from **Published → Draft**.
- The backend automatically manages the `published_at` timestamp.
- Posts are soft deleted and remain in the database for auditing and future restoration.
- Posts may belong to zero or more categories.
- Posts may contain zero or more tags.
- Categories are assigned using `category_slugs`.
- Tags are assigned using `tag_slugs`.
- Duplicate category slugs are rejected.
- Duplicate tag slugs are rejected.
- Only active categories may be assigned to posts.
- Only active tags may be assigned to posts.
- Invalid or inactive taxonomy slugs are rejected before saving.
- Omitting a taxonomy field during update preserves existing relationships.
- Sending an empty taxonomy list clears that relationship.
- Post responses include lightweight nested category objects.
- Post responses include lightweight nested tag objects.
- Shared taxonomy validation is implemented through a reusable serializer mixin.
- Authentication, authorization, ownership, and relationship validation are enforced on the backend.

---

# Taxonomy Validation Errors

## Duplicate Category Slugs

Example invalid request:

```json
{
  "category_slugs": ["backend", "backend"]
}
```

Expected result:

```text
400 Bad Request
```

Example error:

```json
{
  "category_slugs": ["Duplicate category slugs are not allowed."]
}
```

---

## Duplicate Tag Slugs

Example invalid request:

```json
{
  "tag_slugs": ["django", "django"]
}
```

Expected result:

```text
400 Bad Request
```

Example error:

```json
{
  "tag_slugs": ["Duplicate tag slugs are not allowed."]
}
```

---

## Invalid or Inactive Category Slug

Example invalid request:

```json
{
  "category_slugs": ["unknown-category"]
}
```

Expected result:

```text
400 Bad Request
```

Example error:

```json
{
  "category_slugs": ["One or more categories do not exist or are inactive."]
}
```

---

## Invalid or Inactive Tag Slug

Example invalid request:

```json
{
  "tag_slugs": ["unknown-tag"]
}
```

Expected result:

```text
400 Bad Request
```

Example error:

```json
{
  "tag_slugs": ["One or more tags do not exist or are inactive."]
}
```

---

# Categories APIs

## Current Status

Implemented ✅

The Categories module provides reusable taxonomy for organizing blog content. Categories are publicly readable, while creation and updates require the Editor application role.

| Method | Endpoint                | Authentication                | Status         |
| ------ | ----------------------- | ----------------------------- | -------------- |
| GET    | /api/categories/        | Public                        | ✅ Implemented |
| GET    | /api/categories/{slug}/ | Public                        | ✅ Implemented |
| POST   | /api/categories/        | JWT Access Token (Editor)     | ✅ Implemented |
| PATCH  | /api/categories/{slug}/ | JWT Access Token (Editor)     | ✅ Implemented |

## List Categories

```http
GET /api/categories/
```

Returns active categories by default.

---

## Retrieve Category

```http
GET /api/categories/{slug}/
```

Retrieves an active category by slug.

---

## Create Category

```http
POST /api/categories/
```

Restricted to authenticated Editors.

---

## Update Category

```http
PATCH /api/categories/{slug}/
```

Restricted to authenticated Editors.

---

## Category Business Rules

- Category names must be unique.
- Category slugs are generated automatically.
- Category slugs remain stable after creation.
- Categories are publicly readable.
- Only Editors can create or update categories; `is_staff` alone grants no taxonomy API access.
- Active categories are returned by default.
- Inactive categories cannot be assigned to new or updated posts.
- Existing relationships remain intact when a category becomes inactive.
- Categories can be assigned to multiple posts.
- Posts can belong to multiple categories.
- Categories are associated with posts using slug-based identifiers.
- Nested category information is returned in post responses.

---

# Tags APIs

## Current Status

Implemented ✅

The Tags module provides reusable taxonomy for classifying and improving discovery of blog content. Tags are publicly readable, while creation and updates require the Editor application role.

| Method | Endpoint          | Authentication                | Status         |
| ------ | ----------------- | ----------------------------- | -------------- |
| GET    | /api/tags/        | Public                        | ✅ Implemented |
| GET    | /api/tags/{slug}/ | Public                        | ✅ Implemented |
| POST   | /api/tags/        | JWT Access Token (Editor)     | ✅ Implemented |
| PATCH  | /api/tags/{slug}/ | JWT Access Token (Editor)     | ✅ Implemented |

## List Tags

```http
GET /api/tags/
```

Returns active tags by default.

---

## Retrieve Tag

```http
GET /api/tags/{slug}/
```

Retrieves an active tag by slug.

---

## Create Tag

```http
POST /api/tags/
```

Restricted to authenticated Editors.

---

## Update Tag

```http
PATCH /api/tags/{slug}/
```

Restricted to authenticated Editors.

---

## Tag Business Rules

- Tag names must be unique.
- Tag slugs are generated automatically.
- Tag slugs remain stable after creation.
- Tags are publicly readable.
- Only Editors can create or update tags; `is_staff` alone grants no taxonomy API access.
- Active tags are returned by default.
- Inactive tags cannot be assigned to new or updated posts.
- Existing relationships remain intact when a tag becomes inactive.
- Tags can be assigned to multiple posts.
- Posts can contain multiple tags.
- Tags are associated with posts using slug-based identifiers.
- Nested tag information is returned in post responses.

---

# Comments APIs

## Current Status

Implemented ✅

The Comments module enables public discussions on published posts while enforcing authenticated creation, ownership-based updates and deletion, audit tracking, and soft deletion.

| Method | Endpoint                         | Authentication                         | Status         |
| ------ | -------------------------------- | -------------------------------------- | -------------- |
| GET    | /api/posts/{post_slug}/comments/ | Public                                 | ✅ Implemented |
| POST   | /api/posts/{post_slug}/comments/ | JWT Access Token                       | ✅ Implemented |
| PATCH  | /api/comments/{id}/              | JWT Access Token (Comment Author Only) | ✅ Implemented |
| DELETE | /api/comments/{id}/              | JWT Access Token (Comment Author Only) | ✅ Implemented |

---

## List Comments

```http
GET /api/posts/{post_slug}/comments/
```

### Authentication

Public.

### Behavior

Returns non-deleted comments belonging to a published, non-deleted post.

Comments are returned in chronological order.

Related author information is loaded using:

```python
select_related("author")
```

### Successful Response

Status:

```text
200 OK
```

Example:

```json
[
  {
    "id": 1,
    "content": "This article was very helpful.",
    "author": {
      "id": 2,
      "username": "john"
    },
    "created_at": "2026-07-15T10:00:00+05:30",
    "updated_at": "2026-07-15T10:00:00+05:30"
  }
]
```

A post with no comments returns an empty list:

```json
[]
```

---

## Create Comment

```http
POST /api/posts/{post_slug}/comments/
```

### Authentication

JWT Access Token required.

### Example Request

```json
{
  "content": "This article was very helpful."
}
```

The backend automatically assigns:

- The post from the URL slug
- The author from `request.user`
- `created_by`
- `updated_by`

Clients cannot control ownership or audit fields.

### Successful Response

Status:

```text
201 Created
```

Example:

```json
{
  "id": 1,
  "content": "This article was very helpful.",
  "author": {
    "id": 2,
    "username": "john"
  },
  "created_at": "2026-07-15T10:00:00+05:30",
  "updated_at": "2026-07-15T10:00:00+05:30"
}
```

---

## Update Comment

```http
PATCH /api/comments/{id}/
```

### Authentication

JWT Access Token required.

### Permission

Only the Comment author may update the Comment.

### Example Request

```json
{
  "content": "Updated comment content."
}
```

Only `content` is writable.

The Comment author and parent Post cannot be reassigned.

### Successful Response

Status:

```text
200 OK
```

---

## Delete Comment

```http
DELETE /api/comments/{id}/
```

### Authentication

JWT Access Token required.

### Permission

Only the Comment author may delete the Comment.

### Behavior

The Comment is soft deleted.

The database record remains available for auditing and future restoration, but it is excluded from normal API queries.

### Successful Response

Status:

```text
204 No Content
```

---

## Comment Validation Errors

### Missing Content

```json
{}
```

Expected:

```text
400 Bad Request
```

### Blank or Whitespace-Only Content

```json
{
  "content": "   "
}
```

Expected:

```text
400 Bad Request
```

### Content Exceeding Maximum Length

Comment content is limited to 2,000 characters.

Content exceeding this limit returns:

```text
400 Bad Request
```

### Invalid or Non-Public Post

The following Post states return:

```text
404 Not Found
```

- Invalid slug
- Draft Post
- Unpublished Post
- Soft-deleted Post

Using `404` prevents disclosure of unpublished content.

---

## Comment Business Rules

- Comments belong to exactly one Post.
- Comments belong to exactly one author.
- Comments may only be created on published, non-deleted Posts.
- Public users may list Comments on published Posts.
- Only authenticated users may create Comments.
- Only the Comment author may update a Comment.
- Only the Comment author may soft delete a Comment.
- Post ownership does not grant ownership of another user's Comment.
- Comment authors are assigned by the backend.
- Parent Posts are resolved from the URL.
- Comments cannot be reassigned to another author or Post.
- Soft-deleted Comments are excluded from normal queries.
- Comment responses expose `id` and `username` for the author.
- Email addresses and audit fields are not exposed publicly.
- Editor Comment moderation is not currently implemented and remains a future feature.

---

# Profiles APIs

## Current Status

Implemented ✅

The Profiles module provides authenticated profile management and public author profile access while enforcing ownership boundaries, privacy controls, validation rules, and query optimization.

| Method | Endpoint                       | Authentication   | Status        |
| ------ | ------------------------------ | ---------------- | ------------- |
| GET    | /api/profile/                  | JWT Access Token | ✅ Implemented |
| PATCH  | /api/profile/                  | JWT Access Token | ✅ Implemented |
| GET    | /api/users/{username}/profile/ | Public           | ✅ Implemented |

---

## Retrieve Current Profile

```http
GET /api/profile/
```

### Authentication

JWT Access Token required.

### Behavior

Returns the authenticated user's Profile information.

The Profile is automatically determined from the authenticated User.

Clients do not provide:

* Profile ID
* User ID
* Username

for Profile retrieval.

### Successful Response

```json
{
    "username": "john",
    "email": "john@example.com",
    "bio": "Backend Developer",
    "website": "https://example.com",
    "location": "Chennai",
    "date_of_birth": "2000-01-01"
}
```

### Response Fields

| Field         | Description        |
| ------------- | ------------------ |
| username      | User username      |
| email         | User email address |
| bio           | User biography     |
| website       | Personal website   |
| location      | User location      |
| date_of_birth | User date of birth |

### Status Codes

| Status | Meaning                 |
| ------ | ----------------------- |
| 200    | Success                 |
| 401    | Authentication required |

---

## Update Current Profile

```http
PATCH /api/profile/
```

### Authentication

JWT Access Token required.

### Behavior

Updates the authenticated user's Profile.

Profile ownership is enforced through:

```python
request.user
```

The client cannot update another user's Profile.

### Example Request

```json
{
    "bio": "Backend Developer",
    "location": "Chennai"
}
```

### Successful Response

```json
{
    "username": "john",
    "email": "john@example.com",
    "bio": "Backend Developer",
    "website": "https://example.com",
    "location": "Chennai",
    "date_of_birth": "2000-01-01"
}
```

### Validation Rules

#### Website Validation

The website field must contain a valid URL.

Example:

```json
{
    "website": "https://example.com"
}
```

#### Date of Birth Validation

Date of birth cannot be in the future.

Invalid example:

```json
{
    "date_of_birth": "2030-01-01"
}
```

### Protected Fields

The following fields cannot be updated through the API:

* user
* username
* email
* created_at
* updated_at

### Status Codes

| Status | Meaning                 |
| ------ | ----------------------- |
| 200    | Updated Successfully    |
| 400    | Validation Error        |
| 401    | Authentication Required |

---

## Retrieve Public Profile

```http
GET /api/users/{username}/profile/
```

### Authentication

Not required.

### Behavior

Returns safe public Profile information for the specified User.

Profiles are retrieved using:

```text
username
```

rather than internal database identifiers.

### Example Response

```json
{
    "username": "john",
    "bio": "Backend Developer",
    "website": "https://example.com",
    "location": "Chennai"
}
```

### Public Profile Fields

| Field         | Exposed |
| ------------- | ------- |
| username      | ✅       |
| bio           | ✅       |
| website       | ✅       |
| location      | ✅       |
| email         | ❌       |
| date_of_birth | ❌       |
| created_at    | ❌       |
| updated_at    | ❌       |

### Status Codes

| Status | Meaning        |
| ------ | -------------- |
| 200    | Success        |
| 404    | User Not Found |

---

## Profile Business Rules

* Every User owns exactly one Profile.
* Every Profile belongs to exactly one User.
* Profiles are automatically created when Users are created.
* Existing Users receive Profiles through a backfill migration.
* Profile ownership is enforced through `request.user`.
* Public profile access does not require authentication.
* Profile updates require authentication.
* Public profile responses exclude private information.
* Profile APIs use separate serializers for public, private, and update operations.
* Date of birth cannot be set to a future date.
* Profile queries use `select_related("user")` for optimization.

---

## Security Considerations

### Ownership Enforcement

Profile updates always operate on:

```python
request.user.profile
```

This prevents users from selecting another Profile through request data.

### IDOR Prevention

The update endpoint:

```http
PATCH /api/profile/
```

does not expose Profile IDs or User IDs.

This eliminates common Insecure Direct Object Reference (IDOR) attack vectors.

### Privacy Controls

Public Profile responses intentionally exclude:

* email
* date_of_birth
* internal identifiers
* audit metadata

Only safe public information is exposed.

---

## Query Optimization

Profile APIs use:

```python
Profile.objects.select_related("user")
```

This ensures Profile and User information are loaded efficiently in a single database query and prevents N+1 query issues.


---

# Search API

## Current Status

Implemented ✅

| Method | Endpoint             | Authentication | Status         |
| ------ | -------------------- | -------------- | -------------- |
| GET    | /api/posts/search/   | Public         | ✅ Implemented |

`q` is required, trimmed, and must contain 2–100 characters.

```http
GET /api/posts/search/?q=django+rest&page=1&page_size=10
```

Search is limited to published, non-deleted posts. PostgreSQL web-search syntax is used with weighted fields: title (`A`), excerpt (`B`), and content (`C`). Results are ordered by rank, publication time, and creation time.

Pagination defaults to 10 results and allows `page_size` values up to 50. Responses use the normal paginated DRF structure and the Post list representation.

---

# Featured Image API

## Current Status

Implemented ✅

| Method | Endpoint                                  | Authentication               | Content Type          |
| ------ | ----------------------------------------- | ---------------------------- | --------------------- |
| PUT    | /api/posts/{slug}/featured-image/         | JWT (Owner Author or Editor) | `multipart/form-data` |
| DELETE | /api/posts/{slug}/featured-image/         | JWT (Owner Author or Editor) | —                     |

The upload field is named `image`. A successful upload or replacement returns:

```json
{
  "featured_image_url": "http://localhost:8000/media/posts/featured/2026/07/example.webp"
}
```

Validation requires a genuine, non-animated JPEG, PNG, or WebP image. The filename extension, declared MIME type, and Pillow-detected format must agree. Limits are 5 MB, 8,000 × 8,000 pixels, and 40 million total pixels.

Replacing or removing an image updates storage through the Django Storage API. Old-file deletion is scheduled with `transaction.on_commit()` so a rolled-back database transaction does not prematurely remove the existing file. Deleting the image returns `204 No Content`.

Public Post list, detail, and search responses expose `featured_image_url`; clients never receive internal storage paths.

---

# Role-Based Authorization

Feature 14 uses independent Django Groups as application roles:

- `Author`
- `Editor`
- `Administrator`

Registration does not assign roles. Roles are provisioned as Group records by a data migration and must be assigned through a trusted administrative process.

| Operation | Required authorization |
| --------- | ---------------------- |
| Public Post list/detail/search | Public; published and non-deleted Posts only |
| Create Post | Authenticated Author or Editor |
| Manage Post | Owner Author or Editor; queryset is scoped before object lookup |
| Create/update Category or Tag | Authenticated Editor |
| List/retrieve Category or Tag | Public |
| Create Comment | Any authenticated user |
| Update/delete Comment | Authenticated Comment author |
| Private Profile access | Authenticated profile owner |

Administrator is intentionally not an editorial super-role. An Administrator who also needs editorial access must additionally belong to the Editor group. Django `is_staff` and `is_superuser` remain framework-level flags and are not substitutes for application roles.

For Post management, Editors receive all active, non-deleted Posts while Authors receive only their own. Consequently, an Author requesting another user's private Post normally receives `404 Not Found`, reducing object enumeration and IDOR risk.

---

# Future API Modules

As the project grows, additional API modules will be added.

Planned modules include:

- User Administration and Role Management
- Performance Optimization
- Deployment and CI/CD

---

# Request Format

All requests use JSON unless a future endpoint explicitly supports another media type.

Example:

```json
{
  "username": "john_doe",
  "password": "your_password"
}
```

---

# Response Format

Successful responses return JSON unless the endpoint intentionally returns no response body, such as a successful delete operation.

Example:

```json
{
  "message": "Success"
}
```

Validation, authentication, authorization, and not-found responses follow predictable JSON structures generated by Django REST Framework and the project's serializers.

---

# HTTP Status Codes

The project uses standard HTTP status codes.

| Status Code | Meaning               |
| ----------- | --------------------- |
| 200         | OK                    |
| 201         | Created               |
| 204         | No Content            |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 403         | Forbidden             |
| 404         | Not Found             |
| 500         | Internal Server Error |

---

# Authentication Strategy

The project currently uses JWT Authentication through Django REST Framework Simple JWT.

Authentication is based on:

- JWT Access Token
- JWT Refresh Token
- Authorization Header
- Refresh token blacklisting

Access tokens authenticate protected API requests.

Refresh tokens are used to obtain new access tokens and support secure logout through token blacklisting.

Example:

```text
Authorization: Bearer <access_token>
```

The backend validates every protected request before processing it.

---

# Authorization Strategy

The current API enforces:

- Authentication for protected operations
- Editor-only taxonomy management
- Author ownership with Editor override for Post management
- Author-or-Editor role checks for Post creation
- Authorization-scoped Post management querysets
- Backend relationship validation
- Backend publishing workflow validation
- Comment ownership for update and soft-delete operations
- Object-level Comment authorization through `IsCommentAuthor`
- Published-Post validation for Comment listing and creation
- Backend-controlled Comment author and Post assignment
- Profile ownership enforcement through authenticated User context
- Public/private Profile representation separation
- Backend-controlled Profile ownership

Frontend restrictions are considered user-experience controls only and are not trusted for security.

Application roles are independent: Author, Editor, and Administrator. Multiple groups may be assigned when a user needs combined responsibilities.

---

# Performance Strategy

## Post Query Optimization

The Posts API prevents N+1 query problems by eagerly loading related data.

Current optimization:

```python
Post.objects.select_related(
    "author",
).prefetch_related(
    "categories",
    "tags",
)
```

### Why `select_related()` is used

`author` is a foreign-key relationship and can be loaded through a SQL join.

### Why `prefetch_related()` is used

`categories` and `tags` are many-to-many relationships and require separate optimized queries.

This keeps list and detail serialization efficient as the number of posts grows.

---

## Comment Query Optimization

The Comments API prevents N+1 queries by eagerly loading related User and Post records where required.

For Comment listing:

```python
Comment.objects.filter(
    post=post,
).select_related(
    "author",
)
```

For Comment update and deletion:

```python
Comment.objects.select_related(
    "author",
    "post",
)
```

`select_related()` is appropriate because `author` and `post` are foreign-key relationships.

---

# Versioning Strategy

The API is designed to support versioning in the future.

Example:

```text
/api/v1/
````

Versioning will be introduced only when required to preserve backward compatibility during breaking API changes.

---

# Current Project Status

## Completed

- ✅ Feature 00 — Project Dashboard
- ✅ Feature 01 — Project Foundation & Architecture
- ✅ Feature 02 — Custom User Model & User App Architecture
- ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs
- ✅ Feature 04 — Posts Domain Architecture & Database Design
- ✅ Feature 05 — Publishing Workflow
- ✅ Feature 06 — Categories
- ✅ Feature 07 — Tags
- ✅ Feature 08 — Post–Category Relationship
- ✅ Feature 09 — Post–Tag Relationship
- ✅ Feature 10 — Comments
- ✅ Feature 11 — User Profiles
- ✅ Feature 12 — Search
- ✅ Feature 13 — Media Uploads
- ✅ Feature 14 — Permissions & Authorization

## Current API State

Authentication, Posts, Categories, Tags, Comments, Profiles, Search, Media Uploads, and role-based authorization have been implemented and manually tested.

The platform currently supports:

- User registration and authentication
- JWT authentication
- Author-or-Editor Post creation
- Public listing of published posts
- Published post retrieval by slug
- Owner-Author or Editor post updates
- Owner-Author or Editor soft deletion
- Owner-Author or Editor publishing
- Owner-Author or Editor unpublishing
- Backend-enforced publishing workflow
- Public category listing and retrieval
- Editor-managed category creation and updates
- Automatic category slug generation
- Public tag listing and retrieval
- Editor-managed tag creation and updates
- Automatic tag slug generation
- Category assignment using `category_slugs`
- Tag assignment using `tag_slugs`
- Updating category and tag relationships
- Clearing category and tag relationships
- Preserving relationships when taxonomy fields are omitted
- Nested category representation in post responses
- Nested tag representation in post responses
- Backend validation of category relationships
- Backend validation of tag relationships
- Shared taxonomy validation through a serializer mixin
- Optimized author, category, and tag query loading
- Public Comment listing for published Posts
- Authenticated Comment creation
- Comment author ownership enforcement
- Author-only Comment updates
- Author-only Comment soft deletion
- Published-Post validation for Comments
- Backend-controlled Comment author and Post assignment
- Comment audit tracking
- Comment query optimization using `select_related`
- Authenticated Profile retrieval
- Authenticated Profile updates
- Public User Profile viewing
- Automatic Profile creation
- Existing User Profile backfill
- Public/private Profile serialization
- Profile ownership enforcement
- Date-of-birth validation
- Profile query optimization using `select_related`
- Public full-text Post search with weighted ranking
- Search pagination and query validation
- Featured-image upload, replacement, removal, and public URL generation
- Layered image validation and transaction-safe storage cleanup
- Independent Author, Editor, and Administrator roles
- Centralized DRF role permissions
- Post queryset scoping and Editor override
- Separation of application roles from Django staff access

Future features will extend the API with user administration, role management, performance improvements, and deployment support.

---

# Authentication Endpoints

| Endpoint                      | Description                                |
| ----------------------------- | ------------------------------------------ |
| POST /api/auth/register/      | Register a new account                     |
| POST /api/auth/login/         | Authenticate a user and receive JWT tokens |
| GET /api/auth/me/             | Retrieve the authenticated user's account information |
| POST /api/auth/logout/        | Blacklist the supplied refresh token       |
| POST /api/auth/token/refresh/ | Obtain a new access token                  |
| POST /api/auth/token/verify/  | Verify the validity of a JWT               |

---

# Posts Endpoints

| Endpoint                          | Description                                                   |
| --------------------------------- | ------------------------------------------------------------- |
| POST /api/posts/                  | Create a draft post with optional category and tag assignment |
| GET /api/posts/                   | List published posts                                          |
| GET /api/posts/{slug}/            | Retrieve a published post                                     |
| PATCH /api/posts/{slug}/          | Update a post and its assigned categories and tags            |
| DELETE /api/posts/{slug}/         | Soft delete a post owned by the authenticated user            |
| POST /api/posts/{slug}/publish/   | Publish a draft post                                          |
| POST /api/posts/{slug}/unpublish/ | Move a published post back to draft                           |

---

# Categories Endpoints

| Endpoint                      | Description                        |
| ----------------------------- | ---------------------------------- |
| GET /api/categories/          | List active categories             |
| GET /api/categories/{slug}/   | Retrieve a category by slug        |
| POST /api/categories/         | Create a new category (Editor Only) |
| PATCH /api/categories/{slug}/ | Update a category (Editor Only)     |

## Category Relationship Support

Categories are integrated with the Posts module.

Posts reference categories using:

```text
category_slugs
```

Post responses include lightweight nested category objects containing:

- `name`
- `slug`

---

# Tags Endpoints

| Endpoint                | Description                   |
| ----------------------- | ----------------------------- |
| GET /api/tags/          | List active tags              |
| GET /api/tags/{slug}/   | Retrieve a tag by slug        |
| POST /api/tags/         | Create a new tag (Editor Only) |
| PATCH /api/tags/{slug}/ | Update a tag (Editor Only)     |

## Tag Relationship Support

Tags are integrated with the Posts module.

Posts reference tags using:

```text
tag_slugs
```

Post responses include lightweight nested tag objects containing:

- `name`
- `slug`

---

# Comments Endpoints

| Endpoint                              | Description                                           |
| ------------------------------------- | ----------------------------------------------------- |
| GET /api/posts/{post_slug}/comments/  | List visible Comments for a published Post            |
| POST /api/posts/{post_slug}/comments/ | Create a Comment on a published Post                  |
| PATCH /api/comments/{id}/             | Update a Comment owned by the authenticated user      |
| DELETE /api/comments/{id}/            | Soft delete a Comment owned by the authenticated user |

---

# Profiles Endpoints

| Endpoint | Description |
|-----------|-------------|
| GET /api/profile/ | Retrieve the authenticated user's Profile |
| PATCH /api/profile/ | Update the authenticated user's Profile |
| GET /api/users/{username}/profile/ | Retrieve a public Profile by username |

---

# Next Update

Feature 15 will introduce Administrator-only User Administration and Role Management APIs, including safe account activation/deactivation and allowlisted application-role assignment.
