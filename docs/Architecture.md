# Architecture

## Project Overview

The **Production-Grade Blog Platform** is a full-stack web application designed using an **API-First Architecture**. The frontend and backend are developed as independent applications that communicate exclusively through REST APIs.

This project emphasizes production-ready software engineering practices, including scalability, maintainability, security, testing, and clean architecture, while serving as a practical learning platform for Django, Django REST Framework, React, and PostgreSQL.

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router *(planned)*
* Axios *(planned)*

### Backend

* Django
* Django REST Framework

### Database

* PostgreSQL

### Authentication *(Planned)*

* JWT Authentication

### Deployment *(Planned)*

* Docker
* Gunicorn
* Nginx
* Linux Server

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

* API-First Development
* Separation of Concerns
* Single Responsibility Principle (SRP)
* SOLID Principles
* Clean Code
* Production-Ready Folder Structure
* Backend-Enforced Security
* Incremental Feature Development

---

# Frontend Architecture

## Technology

* React
* Vite
* Tailwind CSS

## Responsibilities

* Render the user interface.
* Manage client-side state.
* Consume REST APIs.
* Handle routing.
* Manage authentication state.
* Display server responses and validation errors.

The frontend is responsible only for presentation and user interaction. It never contains business rules or permission enforcement.

---

# Backend Architecture

## Technology

* Django
* Django REST Framework

## Responsibilities

* Business logic
* Authentication
* Authorization
* Request validation
* Response serialization
* Permission enforcement
* Database interaction

The backend is the single source of truth for all application rules and security.

---

# Database Architecture

## Technology

* PostgreSQL

## Responsibilities

* Persistent data storage
* Relationship management
* Data integrity
* Constraints
* Indexes
* Transaction support

All database operations are performed through Django's ORM.

---

# Current Application Structure

```text
backend/
│
├── apps/
│   ├── core/
│   └── users/
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

---

# Authentication Architecture

The project adopts a **custom Django User model** from the beginning of development.

Choosing a custom user model before the first database migration prevents costly schema migrations later and provides flexibility for future authentication requirements.

## Current Status (Feature 02)

Implemented:

* Custom User model using `AbstractUser`
* `AUTH_USER_MODEL` configured
* Dedicated `users` application
* Foundation for future authentication features

Planned:

* JWT Authentication
* Login
* Registration
* Password Reset
* Refresh Tokens
* Role-Based Authorization
* User Profiles

---

# Request Flow

Current request flow:

```text
Client
   │
   ▼
Django URL Router
   │
   ▼
Django REST Framework View
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
Frontend
```

Responses are serialized into JSON before being returned to the client.

---

# Security Architecture

The backend is responsible for enforcing all security rules.

Current security principles include:

* Never trust client input.
* Enforce permissions on the backend.
* Validate all incoming data.
* Use Django ORM to prevent SQL injection.
* Store passwords using Django's secure password hashing.
* Prepare for JWT-based authentication.
* Support object-level permissions in future features.

---

# Scalability Considerations

The architecture is designed to support future growth without major refactoring.

Planned scalability features include:

* Independent Django applications
* JWT Authentication
* Pagination
* Search and filtering
* Caching
* Object-level permissions
* Docker deployment
* Reverse proxy with Nginx
* Horizontal scaling

---

# Current Project Status

## Completed

* ✅ Feature 01 — Project Foundation & Architecture
* ✅ Feature 02 — Custom User Model & User App Architecture

## In Progress

* None

## Next Feature

* Feature 03 — Custom User Manager & Authentication Foundation

---

# Future Architecture Evolution

As development progresses, the architecture will expand with additional domain applications, including:

* Posts
* Categories
* Tags
* Comments
* Profiles

Each application will remain independent while communicating through shared project architecture and REST APIs, preserving modularity and maintainability.
