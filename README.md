# Production-Grade Blog Platform

API-first blog platform built with Django REST Framework and React.

This project focuses on real-world software engineering practices including scalable architecture, authentication, security, testing, and maintainability.

---

# Tech Stack

## Backend
- Django
- Django REST Framework (DRF)
- PostgreSQL
- JWT Authentication (planned)
- Role-Based Permissions
- django-guardian (planned)

## Frontend
- React
- Vite
- Tailwind CSS

---

# Architecture Overview

## Design Principles
- API-first architecture
- Modular Django apps
- Service-oriented structure (future enhancement)
- Environment-based configuration (dev / production)
- Separation of concerns

## System Flow

Client (React)
   ↓
Django REST Framework API
   ↓
Business Logic Layer
   ↓
PostgreSQL Database

---

# Project Structure

```text
blog-platform/
│
├── backend/
│   ├── apps/
│   │   ├── core/
│   │   └── users/
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
│   └── ADR/
│
└── README.md