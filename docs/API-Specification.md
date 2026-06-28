# API Specification

# API Overview

The Blog Platform follows an **API-First Architecture**, where all communication between the frontend and backend occurs through REST APIs.

At the completion of **Feature 02**, no API endpoints have been implemented yet. This document defines the planned API structure and will be updated incrementally as each feature is completed.

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

**Not implemented**

The authentication architecture has been established, but the API endpoints will be introduced in future features.

---

## Planned Endpoints

| Method | Endpoint                     | Status  |
| ------ | ---------------------------- | ------- |
| POST   | `/api/auth/register/`        | Planned |
| POST   | `/api/auth/login/`           | Planned |
| POST   | `/api/auth/logout/`          | Planned |
| POST   | `/api/auth/refresh/`         | Planned |
| GET    | `/api/auth/me/`              | Planned |
| PATCH  | `/api/auth/me/`              | Planned |
| POST   | `/api/auth/change-password/` | Planned |

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

Future authentication will use:

* JWT Access Token
* JWT Refresh Token
* Authorization Header

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

## Current API State

No API endpoints have been implemented yet.

The project currently provides the architectural foundation for future REST API development.

## Next Update

Feature 03 will introduce the first authentication-related APIs and this document will be updated to include request/response examples, validation rules, and endpoint details.
