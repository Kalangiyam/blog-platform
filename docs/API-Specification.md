# API Specification

# API Overview

The Blog Platform follows an **API-First Architecture**, where all communication between the frontend and backend occurs through REST APIs.

At the completion of Feature 08, the platform provides four API modules:

- Authentication APIs
- Posts APIs
- Categories APIs
- Tags APIs

Feature 08 extends the Posts API by introducing a many-to-many relationship between Posts and Categories. Categories can now be assigned to posts using category slugs, and post responses include nested category information.

Authentication is implemented using JWT Authentication with Django REST Framework and Simple JWT.

The Posts module provides the foundation for blog content management, including post creation, retrieval, updating, soft deletion, and publishing workflows.

The Categories and Tags modules provide reusable taxonomy management through slug-based endpoints with staff-controlled administration. Both domains are designed for future integration with Posts.

Future features will continue extending this document as new API modules are introduced.

---

# API Principles

The project follows these API design principles:

* RESTful API design
* JSON request and response format
* Stateless communication
* Backend validation
* Backend authorization
* Consistent response structure
* Appropriate HTTP status codes
* Version-ready API design

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

| Method | Endpoint | Authentication | Status |
|--------|----------|----------------|--------|
| POST | /api/auth/register/ | Public | ✅ Implemented |
| POST | /api/auth/login/ | Public | ✅ Implemented |
| GET | /api/auth/me/ | JWT Access Token | ✅ Implemented |
| POST | /api/auth/logout/ | JWT Access Token | ✅ Implemented |
| POST | /api/auth/token/refresh/ | Refresh Token | ✅ Implemented |
| POST | /api/auth/token/verify/ | Public | ✅ Implemented |

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

The Posts module provides CRUD functionality for blog posts while enforcing ownership rules and soft deletion.

| Method | Endpoint | Authentication | Status |
|--------|----------|----------------|--------|
| POST | /api/posts/ | JWT Access Token | ✅ Implemented |
| GET | /api/posts/ | Public | ✅ Implemented |
| GET | /api/posts/{slug}/ | Public | ✅ Implemented |
| PATCH | /api/posts/{slug}/ | JWT Access Token (Author Only) | ✅ Implemented |
| DELETE | /api/posts/{slug}/ | JWT Access Token (Author Only) | ✅ Implemented |
| POST | /api/posts/{slug}/publish/ | JWT Access Token (Author Only) | ✅ Implemented |
| POST | /api/posts/{slug}/unpublish/ | JWT Access Token (Author Only) | ✅ Implemented |

### Create Post

```http
POST /api/posts/
```

### Example Request

```json
{
    "title": "Introduction to Django",
    "excerpt": "Learn the fundamentals of Django.",
    "content": "Full article content...",
    "category_slugs": [
        "django",
        "python"
    ]
}
```

### List Published Posts

```http
GET /api/posts/
```

### Retrieve Single Post

```http
GET /api/posts/{slug}/
```

### Update Post

```http
PATCH /api/posts/{slug}/
```

### Example Request

```json
{
    "title": "Updated Django Guide",
    "category_slugs": [
        "django",
        "backend"
    ]
}
```

### Example Response

```json
{
    "title": "Introduction to Django",
    "slug": "introduction-to-django",
    "status": "published",
    "categories": [
        {
            "name": "Django",
            "slug": "django"
        },
        {
            "name": "Python",
            "slug": "python"
        }
    ]
}
```

### Delete Post (Soft Delete)

```http
DELETE /api/posts/{slug}/
```

### Publish Post

```http
POST /api/posts/{slug}/publish/
```

### Unublish Post

```http
POST /api/posts/{slug}/unpublish/
```

### Business Rules

* Only authenticated users can create posts.
* Newly created posts are saved as **Draft**.
* Only **Published** posts are publicly visible.
* Only the post author can update, delete, publish, or unpublish a post.
* A post can only transition from **Draft → Published**.
* A post can only transition from **Published → Draft**.
* The backend automatically manages the `published_at` timestamp.
* Posts are soft deleted and remain in the database for auditing and future restoration.
* Posts may belong to zero or more categories.
* Categories are assigned using `category_slugs`.
* Duplicate category slugs are rejected.
* Only active categories may be assigned to posts.
* Category slugs are validated before saving.
* Post responses include lightweight nested category objects.

# Categories APIs

## Current Status

Implemented ✅

The Categories module provides reusable taxonomy for organizing blog content. Categories are publicly readable while creation and updates are restricted to staff users.

| Method | Endpoint | Authentication | Status |
|--------|----------|----------------|--------|
| GET | /api/categories/ | Public | ✅ Implemented |
| GET | /api/categories/{slug}/ | Public | ✅ Implemented |
| POST | /api/categories/ | JWT Access Token (Staff Only) | ✅ Implemented |
| PATCH | /api/categories/{slug}/ | JWT Access Token (Staff Only) | ✅ Implemented |

### List Categories

```http
GET /api/categories/
```

### Retrieve Category

```http
GET /api/categories/{slug}/
```

### Create Category

```http
POST /api/categories/
```

### Update Category

```http
PATCH /api/categories/{slug}/
```

### Business Rules

* Category names must be unique.
* Category slugs are generated automatically.
* Slugs remain stable after creation.
* Categories are publicly readable.
* Only staff users can create or update categories.
* Active categories are returned by default.
* Categories can be assigned to one or more posts.
* Categories are associated with posts using slug-based identifiers.
* Nested category information is returned in post responses.

# Tags APIs

## Current Status

Implemented ✅

The Tags module provides reusable taxonomy for classifying blog content. Tags are publicly readable while creation and updates are restricted to staff users.

| Method | Endpoint | Authentication | Status |
|--------|----------|----------------|--------|
| GET | /api/tags/ | Public | ✅ Implemented |
| GET | /api/tags/{slug}/ | Public | ✅ Implemented |
| POST | /api/tags/ | JWT Access Token (Staff Only) | ✅ Implemented |
| PATCH | /api/tags/{slug}/ | JWT Access Token (Staff Only) | ✅ Implemented |

### List Tags

```http
GET /api/tags/
```

### Retrieve Tag

```http
GET /api/tags/{slug}/
```

### Create Tag

```http
POST /api/tags/
```

### Update Tag

```http
PATCH /api/tags/{slug}/
```

### Business Rules

* Tag names must be unique.
* Tag slugs are generated automatically.
* Slugs remain stable after creation.
* Tags are publicly readable.
* Only staff users can create or update tags.
* Active tags are returned by default.
* Tags are designed for future many-to-many association with Posts.

---

# Future API Modules

As the project grows, additional API modules will be added.

## Comments

```text
GET
POST
PATCH
DELETE
```

---

# Request Format

All requests will use JSON.

Example:

```json
{
    "username": "john_doe",
    "password": "your_password"
}
```

---

# Response Format

Successful responses will return JSON.

Example:

```json
{
    "message": "Success"
}
```

Validation and authentication responses will also follow a consistent JSON structure.

---

# HTTP Status Codes

The project will use standard HTTP status codes.

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

The project currently uses JWT Authentication via Django REST Framework Simple JWT.

Authentication is based on:

* JWT Access Token
* JWT Refresh Token
* Authorization Header

Access tokens authenticate protected API requests.

Refresh tokens are used only to obtain new access tokens and to support secure logout through token blacklisting.

Example:

```text
Authorization: Bearer <access_token>
```

The backend will validate every protected request before processing it.

---

# Versioning Strategy

The API is designed to support versioning in the future.

Example:

```text
/api/v1/
```

Versioning will be introduced only when needed to maintain backward compatibility.

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

## Current API State

Authentication, Posts, Categories, and Tags APIs have been fully implemented and manually tested.

The platform currently supports:

- User registration and authentication
- JWT-based authorization
- Post creation
- Public listing of published posts
- Retrieval by slug
- Author-only updates
- Author-only soft deletion
- Author-only publishing
- Author-only unpublishing
- Backend-enforced publishing workflow
- Public category listing
- Public category retrieval
- Staff-managed category creation
- Staff-managed category updates
- Automatic slug generation for categories
- Public tag listing
- Public tag retrieval
- Staff-managed tag creation
- Staff-managed tag updates
- Automatic slug generation for tags
- Assign categories to posts
- Update assigned categories
- Remove assigned categories
- Slug-based category assignment
- Nested category representation in post responses
- Backend validation of category relationships

Future features will extend the API with publishing workflows, categories, tags, comments, reactions, search, and profile management.

## Authentication Endpoints

| Endpoint | Description |
|-----------|-------------|
| POST /api/auth/register/ | Register a new account |
| POST /api/auth/login/ | Authenticate user and receive JWT tokens |
| GET /api/auth/me/ | Retrieve the authenticated user's profile |
| POST /api/auth/logout/ | Blacklist the refresh token |
| POST /api/auth/token/refresh/ | Obtain a new access token |
| POST /api/auth/token/verify/ | Verify the validity of a JWT |

## Posts Endpoints

| Endpoint | Description |
|-----------|-------------|
| POST /api/posts/ | Create a draft post with optional category assignment |
| GET /api/posts/ | List all published posts |
| GET /api/posts/{slug}/ | Retrieve a published post |
| PATCH /api/posts/{slug}/ | Update a post and its assigned categories |
| DELETE /api/posts/{slug}/ | Soft delete a post owned by the authenticated user |
| POST /api/posts/{slug}/publish/ | Publish a draft post |
| POST /api/posts/{slug}/unpublish/ | Move a published post back to draft |

## Categories Endpoints

| Endpoint | Description |
|-----------|-------------|
| GET /api/categories/ | List active categories |
| GET /api/categories/{slug}/ | Retrieve a category by slug |
| POST /api/categories/ | Create a new category (Staff Only) |
| PATCH /api/categories/{slug}/ | Update a category (Staff Only) |

### Relationship Support

Categories are now integrated with the Posts module.

Posts reference categories using the `category_slugs` field.

Responses from the Posts API include lightweight nested category objects containing:

- `name`
- `slug`

## Tags Endpoints

| Endpoint | Description |
|-----------|-------------|
| GET /api/tags/ | List active tags |
| GET /api/tags/{slug}/ | Retrieve a tag by slug |
| POST /api/tags/ | Create a new tag (Staff Only) |
| PATCH /api/tags/{slug}/ | Update a tag (Staff Only) |

## Next Update

Feature 09 will introduce the Post ↔ Tag relationship.

This feature will extend the existing taxonomy architecture by allowing posts to be associated with reusable tags using the same slug-based many-to-many design established for categories.

After Feature 09, shared taxonomy validation logic will be refactored into reusable serializer mixins.