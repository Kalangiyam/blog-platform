# Production-Grade Blog Platform

A production-grade **API-first Blog Platform** built with **Django REST Framework** and **React**.

The project is designed to demonstrate real-world software engineering practices including scalable architecture, secure authentication, clean code, documentation, testing, and maintainability.

---

# Tech Stack

## Backend

* Django
* Django REST Framework (DRF)
* PostgreSQL
* JWT Authentication (Simple JWT)
* Custom User Model
* Email-based Authentication
* Role-Based Permissions (Planned)
* django-guardian (Planned)

## Frontend

* React
* Vite
* Tailwind CSS

---

# Architecture Overview

## Design Principles

* API-First Architecture
* Modular Django Applications
* Separation of Concerns
* Environment-Based Configuration
* Scalable Project Structure
* Security-First Development

## System Flow

```text
React Frontend
       │
       ▼
Django REST Framework API
       │
       ▼
Business Logic
       │
       ▼
PostgreSQL Database
```

---

# Authentication

The project currently includes:

* Custom User Model
* Email-based Login
* JWT Access Tokens
* JWT Refresh Tokens
* Protected API Endpoints
* Refresh Token Blacklisting
* Current User Endpoint (`/api/auth/me/`)

---

# Completed Features

* ✅ Feature 00 — Project Dashboard
* ✅ Feature 01 — Project Foundation & Architecture
* ✅ Feature 02 — Custom User Model & User App Architecture
* ✅ Feature 03 — JWT Authentication Foundation & User Authentication APIs
* ✅ Feature 04 — Posts Domain Architecture & Database Design

---

# Project Structure

```text
blog-platform/
│
├── backend/
│   ├── apps/
│   │   ├── core/
│   │   ├── users/
│   │   └── posts/
│   │
│   ├── config/
│   │   └── settings/
│   │       ├── base.py
│   │       ├── development.py
│   │       └── production.py
│   │
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   │
│   ├── .env
│   ├── .env.example
│   └── manage.py
│
├── frontend/
│
├── docs/
│   ├── adr/
│   ├── features/
│   ├── API-Specification.md
│   ├── Authentication-Flow.md
│   ├── Testing-Strategy.md
│   └── ...
│
└── README.md
```

---

# Current API

Implemented APIs:

### Authentication

```text
POST   /api/auth/register/
POST   /api/auth/login/
GET    /api/auth/me/
POST   /api/auth/logout/
POST   /api/auth/token/refresh/
POST   /api/auth/token/verify/
```
### Posts

```text
POST    /api/posts/
GET     /api/posts/
GET     /api/posts/{slug}/
PATCH   /api/posts/{slug}/
DELETE  /api/posts/{slug}/
```

Additional APIs will be introduced as future features are completed.

---

# Documentation

Project documentation is maintained under the `docs/` directory.

Key documents include:

* API Specification
* Authentication Flow
* Testing Strategy
* Architecture Decision Records (ADRs)
* Feature Completion Reports

Documentation is updated incrementally as each feature is completed.

---

# Roadmap

Upcoming features include:

* Categories
* Tags
* Comments
* Likes & Reactions
* User Profiles
* Search
* Media Uploads
* Permissions & Authorization
* Deployment
* CI/CD
* Performance Optimization

---

# Development Philosophy

This project emphasizes:

* Clean Architecture
* SOLID Principles
* REST API Best Practices
* Security
* Scalability
* Maintainability
* Testability
* Production-Ready Engineering Practices

---

# Current Status

**Current Milestone:** Feature 04 Complete

The blog platform now includes a production-ready Posts domain with support for creating, listing, retrieving, updating, and soft deleting blog posts.

Implemented capabilities include:

- Slug-based post URLs
- Draft and published post workflow foundation
- Public read access for published posts
- Author ownership enforcement
- Object-level permissions
- Soft delete with audit trail
- Optimized querysets using `select_related()`

The next milestone is **Feature 05 — Publishing Workflow**.
