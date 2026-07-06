# Architecture

## Project Overview

The **Production-Grade Blog Platform** is a full-stack web application designed using an **API-First Architecture**. The frontend and backend are developed as independent applications that communicate exclusively through REST APIs.

This project emphasizes production-ready software engineering practices, including scalability, maintainability, security, testing, and clean architecture, while serving as a practical learning platform for Django, Django REST Framework, React, and PostgreSQL.

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router _(planned)_
- Axios _(planned)_

### Backend

- Django
- Django REST Framework

### Database

- PostgreSQL

### Authentication

- JWT Authentication (Simple JWT)
- Email-Based Authentication
- JWT Access Tokens
- JWT Refresh Tokens
- Refresh Token Blacklisting

### Deployment _(Planned)_

- Docker
- Gunicorn
- Nginx
- Linux Server

---

# Architecture Style

The project follows an **API-First, Client-Server Architecture**.

The frontend never communicates directly with the database. Every request passes through the backend API, where authentication, authorization, validation, and business logic are enforced before any database interaction occurs.

```text
┌────────────────────┐
│ React Frontend     │
└─────────┬──────────┘
          │ HTTP / JSON
          ▼
┌────────────────────┐
│ Django REST API    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Business Logic     │
│ (Services / Views) │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Django ORM         │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ PostgreSQL         │
└────────────────────┘
```

---

# Architectural Principles

The project follows these engineering principles:

- API-First Development
- Separation of Concerns
- Single Responsibility Principle (SRP)
- SOLID Principles
- Clean Code
- Production-Ready Folder Structure
- Backend-Enforced Security
- Incremental Feature Development

---

# Frontend Architecture

## Technology

- React
- Vite
- Tailwind CSS

## Responsibilities

- Render the user interface.
- Manage client-side state.
- Consume REST APIs.
- Handle routing.
- Manage authentication state.
- Display server responses and validation errors.

The frontend is responsible only for presentation and user interaction. It never contains business rules or permission enforcement.

---

# Backend Architecture

## Technology

- Django
- Django REST Framework

## Responsibilities

- Business logic
- Authentication
- Authorization
- Request validation
- Response serialization
- Permission enforcement
- Database interaction

The backend is the single source of truth for all application rules and security.

---

# Database Architecture

## Technology

- PostgreSQL

## Responsibilities

- Persistent data storage
- Relationship management
- Data integrity
- Constraints
- Indexes
- Transaction support

All database operations are performed through Django's ORM.

---

# Current Application Structure

```text
backend/
│
├── apps/
│   ├── core/
│   ├── users/
│   └── posts/
│
├── config/
│
├── requirements/
│
└── manage.py
```

### apps/

Contains all business applications.

Each domain of the project (Users, Posts, Comments, Categories, etc.) is implemented as an independent Django application.

### core/

Contains shared functionality used across multiple applications.

### users/

Responsible for user management and the custom user model.

### posts/

Responsible for blog content management.

Current responsibilities include:

- Post creation
- Published post listing
- Single post retrieval
- Author-owned post updates
- Soft deletion
- Slug generation
- Post lifecycle foundation (Draft → Published)

The application follows the same architectural principles as the rest of the project by separating responsibilities across models, serializers, permissions, viewsets, and routing.

---

# Authentication Architecture

The project adopts a **custom Django User model** from the beginning of development.

Choosing a custom user model before the first database migration prevents costly schema migrations later and provides flexibility for future authentication requirements.

## Current Status (Feature 03)

### Implemented:

- Custom User model
- AUTH_USER_MODEL configured
- Email-based authentication backend
- JWT Authentication using Simple JWT
- User Registration API
- User Login API
- User Logout API
- Current User API
- Refresh Token API
- Token Verification API
- Refresh Token Blacklisting

### Planned:

- Password Change
- Password Reset
- Email Verification
- User Profiles
- Role-Based Authorization

---

# Request Flow

Current request flow:

```text
React Frontend
        │
        ▼
HTTP Request
        │
        ▼
Django URL Router
        │
        ▼
JWT Authentication
        │
        ▼
Permissions
        │
        ▼
APIView
        │
        ▼
Serializer
        │
        ▼
Business Logic
        │
        ▼
Django ORM
        │
        ▼
PostgreSQL
```

Each request is validated before reaching the database.

---

# Response Flow

```text
PostgreSQL
   │
   ▼
Django ORM
   │
   ▼
Business Logic
   │
   ▼
Serializer
   │
   ▼
JSON Response
   │
   ▼
React Frontend
```

Responses are serialized into JSON before being returned to the client.

---

# Posts Architecture

The Posts application is implemented as an independent domain module following the project's modular architecture.

### Current Design

- Dedicated `Post` model
- Slug-based resource lookup
- Separate serializers for create, list, retrieve, and update operations
- DRF `GenericViewSet` with action-specific mixins
- Object-level authorization using a custom permission class
- Soft deletion through an abstract base model
- Audit fields for creation, updates, and deletion

### Request Processing

Each Posts API request follows this flow:

```text
React Frontend
        │
        ▼
HTTP Request
        │
        ▼
Django URL Router
        │
        ▼
JWT Authentication
        │
        ▼
Permissions
        │
        ▼
APIView
        │
        ▼
Serializer
        │
        ▼
Business Logic
        │
        ▼
Django ORM
        │
        ▼
PostgreSQL
```

This separation of concerns keeps validation, authorization, business logic, and persistence independent and maintainable.

---

# Security Architecture

The backend is responsible for enforcing all security rules.

## Current security principles include:

- Never trust client input.
- Enforce permissions on the backend.
- Validate all incoming data.
- Use Django ORM to prevent SQL injection.
- Store passwords using Django's secure password hashing.
- Authenticate protected endpoints using JWT.
- Blacklist refresh tokens during logout.
- Enforce object-level permissions for resource ownership.
- Restrict post updates and deletion to the resource owner.
- Use soft deletion to preserve audit history and prevent accidental data loss.

---

# Scalability Considerations

The architecture is designed to support future growth without major refactoring.

Planned scalability features include:

- Independent Django applications
- JWT Authentication (Implemented)
- Pagination
- Search and filtering
- Caching
- Object-level permissions
- Docker deployment
- Reverse proxy with Nginx
- Horizontal scaling

---

# Current Project Status

## Completed

- ✅ Feature 01 — Project Foundation & Architecture
- ✅ Feature 02 — Custom User Model & User App Architecture
- ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs
- ✅ Feature 04 — Posts Domain Architecture & Database Design

## In Progress

- None

## Next Feature

- Feature 05 — Publishing Workflow

---

# Future Architecture Evolution

Future applications will reuse the authentication infrastructure introduced in Feature 03 and the modular domain architecture established in Feature 04.

The Posts application serves as the reference implementation for future domain modules by demonstrating:

- ViewSet-based API design
- Action-specific serializers
- Object-level permissions
- Soft deletion
- Slug-based routing
- Ownership enforcement

As development progresses, the architecture will expand with additional domain applications, including:

- Posts
- Categories
- Tags
- Comments
- Profiles

Each application will remain independent while communicating through shared project architecture and REST APIs, preserving modularity and maintainability.
