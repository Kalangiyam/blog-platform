# Database Design

## Database Engine

PostgreSQL

---

## Database Name

blog_platform

---

## Database Strategy

Development and production environments both use PostgreSQL.

This eliminates environment-specific database behavior and improves deployment consistency.

---

## Future Planned Tables

Users
Posts
Categories
Tags
Comments
Bookmarks
Likes

---

## Migration Strategy

Custom User Model must be implemented before the first migration.

No migrations have been executed yet.

This is a deliberate architectural decision to avoid future user model migration issues.
