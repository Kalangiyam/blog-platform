# ADR-007 — JWT Authentication using Django REST Framework Simple JWT

- **Status:** Accepted
- **Date:** 2026-06-29
- **Feature:** Feature 03 — JWT Authentication Foundation & User Authentication APIs

---

# Context

The Blog Platform requires a secure authentication mechanism that supports a decoupled frontend (React) and backend (Django REST Framework).

The authentication system should:

- Be stateless
- Scale horizontally
- Support mobile and web clients
- Integrate naturally with REST APIs
- Support future role-based authorization

---

# Decision

The project will use:

- Django REST Framework
- Simple JWT
- JWT Access Tokens
- JWT Refresh Tokens
- Email-based authentication
- Refresh token blacklisting

Authentication endpoints are grouped under:

```text
/api/auth/
```

---

# Authentication Strategy

Authentication is based on:

- Email
- Password
- JWT Access Token
- JWT Refresh Token

Protected endpoints require:

```text
Authorization: Bearer <access_token>
```

---

# User Model Decision

The project uses a custom User model derived from `AbstractUser`.

Reasons:

- Django best practice
- Future extensibility
- Email-based authentication
- Role support
- Avoid replacing the user model after initial migrations

---

# Authentication Backend Decision

A custom Email Authentication Backend is used instead of Django's default username authentication.

Benefits:

- Better user experience
- Consistent login identifier
- Flexible future authentication strategies

---

# Token Strategy

The authentication system issues:

- Short-lived Access Tokens
- Long-lived Refresh Tokens

When the access token expires:

1. React sends the refresh token.
2. A new access token is issued.
3. The user remains authenticated without logging in again.

---

# Logout Strategy

Logout blacklists the refresh token.

Benefits:

- Prevents reuse of stolen refresh tokens
- Allows secure session termination
- Integrates with Simple JWT blacklist application

---

# Consequences

## Advantages

- Stateless authentication
- Scalable architecture
- Suitable for SPA applications
- Secure token lifecycle
- Production-ready authentication

## Trade-offs

- Token management is more complex than session authentication.
- Frontend must manage token storage securely.
- Refresh token lifecycle requires careful implementation.

---

# Alternatives Considered

## Django Session Authentication

Pros:

- Simpler
- Built into Django

Cons:

- Less suitable for SPA architecture
- Requires server-side sessions
- Harder to scale across services

---

## OAuth2

Pros:

- Enterprise-grade
- Third-party integrations

Cons:

- Unnecessary complexity for the current project

---

# Outcome

This ADR establishes JWT authentication as the official authentication strategy for the Blog Platform.

Future features will build authorization and ownership rules on top of this authentication foundation.