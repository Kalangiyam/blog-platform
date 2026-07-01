# Authentication Flow

# Authentication Overview

The Blog Platform uses Django's authentication system together with Django REST Framework and Simple JWT to provide secure JWT-based authentication between the React frontend and Django backend.

Authentication has been fully implemented in Feature 03 and serves as the security foundation for all protected APIs.

---

# Current Status (Feature 03)

## Completed

* ✅ Custom User application created
* ✅ Custom User model implemented
* ✅ User model inherits from `AbstractUser`
* ✅ `AUTH_USER_MODEL` configured before the first migration
* ✅ Authentication architecture established
* ✅ Email-based authentication
* ✅ Custom Email Authentication Backend
* ✅ User Registration API
* ✅ User Login API
* ✅ JWT Authentication
* ✅ JWT Access Token
* ✅ JWT Refresh Token
* ✅ Current User API (`/api/auth/me/`)
* ✅ Logout API
* ✅ Refresh Token Blacklisting
* ✅ Token Refresh Endpoint
* ✅ Token Verify Endpoint

## Remaining Authentication Features

The authentication foundation is complete.

Future authentication enhancements include:

* Password Change
* Password Reset
* Email Verification
* Multi-Factor Authentication (Optional)
* Social Authentication (Optional)

---

# Authentication Architecture

The authentication system follows a layered architecture.

```text
React Frontend
        │
        ▼
Authentication API
(Register / Login / Logout / Me)
        │
        ▼
Serializers
        │
        ▼
Email Authentication Backend
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

The authentication module is built on top of the custom User model and Django's authentication framework.

Authentication is performed using a custom Email Authentication Backend, while JWT access and refresh tokens are managed by Django REST Framework Simple JWT.

Why a custom User model?

* Future profile expansion
* Flexible authentication options
* Role-based permissions
* JWT compatibility
* Enterprise scalability
* Avoid changing the user model after migrations

Implementing the custom User model before the initial migration is considered a Django best practice.

---

# Authentication Features

## Implemented

* User Registration
* User Login
* JWT Access Token
* JWT Refresh Token
* Protected User Endpoint
* Logout
* Refresh Token Blacklisting
* Token Refresh
* Token Verification

## Planned

* Password Change
* Password Reset
* Email Verification
* Profile Editing

---

# JWT Authentication Flow

```text
React Frontend
        │
        ▼
Login Request
        │
        ▼
Email Authentication Backend
        │
        ▼
JWT Access Token
JWT Refresh Token
        │
        ▼
Protected API Requests
        │
        ▼
Access Token Expires
        │
        ▼
Refresh Token
        │
        ▼
New Access Token
        │
        ▼
Logout
        │
        ▼
Refresh Token Blacklisted
```

---

# Request Flow

login request:

```text
Client
   │
   ▼
POST /api/auth/login/
   │
   ▼
LoginAPIView
   │
   ▼
LoginSerializer
   │
   ▼
authenticate()
   │
   ▼
EmailBackend
   │
   ▼
Generate JWT Tokens
   │
   ▼
JSON Response
```

---

# Response Flow

successful authentication response:

```text
Client
   │
   ▼
Login Request
   │
   ▼
JWT Tokens Generated
   │
   ▼
Access Token
Refresh Token
User Information
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
* Refresh token blacklisting
* Generic authentication error messages
* Custom email authentication backend

---

# Authorization Strategy

Authentication is complete.

Future features will build authorization on top of the existing JWT authentication system.

---

# Current Project Status

## Completed

* ✅ Feature 01 — Project Foundation & Architecture
* ✅ Feature 02 — Custom User Model & User App Architecture
* ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs

## Current Authentication State

Authentication module fully implemented.

The application now supports registration, login, logout, JWT authentication, protected endpoints, refresh token rotation, and token blacklisting.

# Authentication API Flow

```text
Register
    │
    ▼
User Created
    │
    ▼
Login
    │
    ▼
Access Token + Refresh Token
    │
    ▼
Protected APIs
    │
    ▼
Access Token Expires
    │
    ▼
Token Refresh
    │
    ▼
New Access Token
    │
    ▼
Logout
    │
    ▼
Refresh Token Blacklisted
```

## Next Feature

Feature 04 will build the Posts domain on top of the existing authentication system.

All ownership and permissions will rely on the authenticated user (`request.user`) established in Feature 03.
