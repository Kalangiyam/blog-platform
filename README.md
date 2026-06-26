# Production-Grade Blog Platform

A production-oriented, API-first blog platform built using Django REST Framework and React.

The goal of this project is to implement real-world software engineering practices including scalable architecture, security, testing, documentation, and maintainability.

---

# Tech Stack

## Backend

* Django
* Django REST Framework (DRF)
* PostgreSQL
* JWT Authentication (Planned)
* Django Groups & Custom Permissions
* django-guardian (Planned)

## Frontend

* React
* Vite
* Tailwind CSS

---

# Architecture

## Backend Architecture

* API-First Architecture
* DRF ViewSets + Routers
* Service-Oriented App Structure
* Custom User Model
* Role-Based Permissions
* Object-Level Permissions (Planned)

## Project Structure

```text
blog-platform/
│
├── backend/
│   ├── apps/
│   ├── config/
│   ├── requirements/
│   ├── .env
│   ├── .env.example
│   └── manage.py
│
├── frontend/
│
├── docs/
│   └── ADR/
│
├── README.md
└── .gitignore
```

---

# Backend Structure

```text
backend/
│
├── apps/
│   └── core/
│
├── config/
│   └── settings/
│       ├── base.py
│       ├── development.py
│       └── production.py
│
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
│
└── manage.py
```

---

# Environment Configuration

The project uses environment variables for sensitive configuration.

Create:

```text
backend/.env
```

Required variables:

```env
SECRET_KEY=

DEBUG=True

DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
```

Refer to:

```text
backend/.env.example
```

for the complete template.

---

# Database

Database Engine:

```text
PostgreSQL
```

Database Name:

```text
blog_platform
```

---

# Local Development Setup

## Backend

Create Virtual Environment

```bash
python -m venv venv
```

Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

Install Dependencies

```bash
pip install -r requirements/development.txt
```

Run System Checks

```bash
python manage.py check
```

---

# Documentation

Project documentation is located in:

```text
docs/
```

Including:

* Architecture Documentation
* Database Design
* API Specifications
* Authentication Flow
* Testing Strategy
* Architecture Decision Records (ADRs)

---

# Current Project Status

## Completed Features

### Feature 00

Project Dashboard

### Feature 01

Project Foundation & Architecture

Implemented:

* Project Structure
* Virtual Environment
* Dependency Management
* Settings Separation
* Environment Variables
* PostgreSQL Configuration
* Core Application Setup
* Documentation Foundation

---

# Upcoming Features

* Feature 02 — Custom User Model & User App Architecture
* JWT Authentication
* User Roles & Permissions
* Posts API
* Categories API
* Tags API
* Comments API
* Likes System
* Bookmarks System
* Search Functionality
* Testing Strategy
* Production Deployment

---

# Important Development Rule

The project intentionally has **no migrations executed yet**.

Reason:

```text
Custom User Model
        ↓
First Migration
```

The custom user model must be implemented before running the first migration.

---

# License

This project is being built as a learning-focused, production-grade software engineering project.
