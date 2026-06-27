# Authentication Flow

# Authentication Overview

The Blog Platform uses Django's authentication system as the foundation and will implement **JWT (JSON Web Token) authentication** for secure communication between the React frontend and Django REST Framework backend.

The authentication system is being developed incrementally. At the completion of **Feature 02**, only the authentication foundation has been established.

---

# Current Status (Feature 02)

## Completed

* ✅ Custom User application created
* ✅ Custom User model implemented
* ✅ User model inherits from `AbstractUser`
* ✅ `AUTH_USER_MODEL` configured before the first migration
* ✅ Authentication architecture established

## Not Yet Implemented

* User Registration
* User Login
* JWT Authentication
* Refresh Tokens
* Logout
* Password Reset
* Email Verification
* User Profile Management

These features will be introduced in future iterations.

---

# Authentication Architecture

The authentication system follows a layered architecture.

```text
React Frontend
        │
        ▼
Django REST Framework
        │
        ▼
Authentication Layer
        │
        ▼
Custom User Model
        │
        ▼
PostgreSQL
```

The frontend communicates only with REST API endpoints.

All authentication, authorization, and permission checks are performed on the backend.

---

# Current Authentication Foundation

The project currently uses a **custom User model** as the foundation for all future authentication features.

Why a custom User model?

* Future profile expansion
* Flexible authentication options
* Role-based permissions
* JWT compatibility
* Enterprise scalability
* Avoid changing the user model after migrations

Implementing the custom User model before the initial migration is considered a Django best practice.

---

# Planned Authentication Features

The following authentication features are planned:

* User Registration
* User Login
* JWT Access Token
* JWT Refresh Token
* Logout
* Password Change
* Password Reset
* Email Verification
* User Profile Management

Each feature will be implemented as a separate milestone.

---

# Planned JWT Authentication Flow

```text
React Frontend
        │
        ▼
Login Request
        │
        ▼
Django REST API
        │
        ▼
Validate Credentials
        │
        ▼
Generate JWT Tokens
        │
        ▼
Return Access & Refresh Tokens
        │
        ▼
Frontend Stores Tokens
        │
        ▼
Authenticated API Requests
```

---

# Request Flow

Future login request:

```text
Client
   │
   ▼
POST /api/auth/login/
   │
   ▼
Validate Credentials
   │
   ▼
Generate JWT Tokens
   │
   ▼
Return JSON Response
```

---

# Response Flow

Future successful authentication response:

```text
Client
   │
   ▼
Authentication Request
   │
   ▼
JWT Tokens Generated
   │
   ▼
JSON Response
   │
   ▼
React Stores Tokens
```

---

# Security Principles

The authentication system will follow these security practices:

* Backend authentication only
* Password hashing using Django
* JWT Access and Refresh Tokens
* Backend permission enforcement
* Token expiration
* Secure password validation
* Object-level permissions
* Never trust frontend validation

---

# Future Authorization Strategy

After authentication is implemented, authorization will be based on:

* Authenticated users
* User roles
* Django permissions
* Object-level permissions
* Ownership checks

Permissions will always be enforced on the backend.

---

# Current Project Status

## Completed

* ✅ Feature 01 — Project Foundation & Architecture
* ✅ Feature 02 — Custom User Model & User App Architecture

## Current Authentication State

Authentication foundation established.

No authentication endpoints have been implemented yet.

## Next Feature

Feature 03 will introduce the custom User Manager and begin implementing the authentication system.
