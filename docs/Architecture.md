# Architecture

## Project Overview

Production-grade Blog Platform built with:

* React + Vite
* Tailwind CSS
* Django
* Django REST Framework
* PostgreSQL

The project follows an API-First Architecture where the frontend and backend are completely separated.

---

## High-Level Architecture

React Frontend
↓
Django REST API
↓
Django Business Layer
↓
Django ORM
↓
PostgreSQL

---

## Frontend

Technology:

* React
* Vite
* Tailwind CSS

Responsibilities:

* UI Rendering
* State Management
* API Consumption
* Authentication Flow

---

## Backend

Technology:

* Django
* Django REST Framework

Responsibilities:

* Business Logic
* Authentication
* Authorization
* Data Validation
* API Delivery

---

## Database

Technology:

* PostgreSQL

Responsibilities:

* Persistent Storage
* Relationships
* Constraints
* Indexing

---

## Application Structure

backend/
├── apps/
├── config/
├── requirements/
└── manage.py

Business applications are stored inside the apps directory.

Shared functionality is stored inside apps/core.
