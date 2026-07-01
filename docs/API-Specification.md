# API Specification

# API Overview

The Blog Platform follows an **API-First Architecture**, where all communication between the frontend and backend occurs through REST APIs.

At the completion of Feature 03, the authentication module has been fully implemented using JWT Authentication with Django REST Framework and Simple JWT.

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

# Future API Modules

As the project grows, additional API modules will be added.

## Posts

```text
GET     /api/posts/
GET     /api/posts/{slug}/
POST    /api/posts/
PATCH   /api/posts/{id}/
DELETE  /api/posts/{id}/
```

---

## Categories

```text
GET
POST
PATCH
DELETE
```

---

## Tags

```text
GET
POST
PATCH
DELETE
```

---

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

## Current API State

Authentication APIs have been fully implemented and tested.

Future features will extend the API with posts, categories, tags, comments, reactions, and profile management.

The project currently provides the architectural foundation for future REST API development.

# Authentication Endpoints

| Endpoint | Description |
|-----------|-------------|
| POST /api/auth/register/ | Register a new account |
| POST /api/auth/login/ | Authenticate user and receive JWT tokens |
| GET /api/auth/me/ | Retrieve the authenticated user's profile |
| POST /api/auth/logout/ | Blacklist the refresh token |
| POST /api/auth/token/refresh/ | Obtain a new access token |
| POST /api/auth/token/verify/ | Verify the validity of a JWT |

## Next Update

Feature 04 will introduce the Posts API, including CRUD operations, ownership checks, publishing workflow, and permissions.
