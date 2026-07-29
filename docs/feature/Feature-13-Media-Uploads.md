# Feature 13 — Media Uploads

## Feature Summary

Feature 13 introduces production-ready featured image support for blog posts.

Authors can securely upload, replace, retrieve, and remove a single featured image for each Post while maintaining clean architecture, backend-enforced security, storage abstraction, and transaction-safe file lifecycle management.

The implementation is designed to work with local filesystem storage during development while remaining compatible with future cloud storage providers such as Amazon S3, Cloudinary, or Azure Blob Storage without application-level changes.

---

# Business Requirements

The implementation satisfies the following business requirements:

- Each Post supports one optional featured image.
- Only the Post author can upload or remove a featured image.
- Public APIs expose a featured image URL.
- Images are validated before storage.
- Invalid or malicious uploads are rejected.
- Image replacement safely removes previous files.
- Image removal deletes the stored file.
- Soft-deleted Posts retain their images.
- Storage cleanup remains transaction-safe.

---

# Architecture Summary

The feature follows the project's layered architecture.

```text
Client
    │
    ▼
ViewSet
    │
    ▼
Serializer
    │
    ▼
Featured Image Service
    │
    ├── Database Transaction
    └── Django Storage API
            │
            ▼
     Local Storage / Future Cloud Storage
```

Business logic is isolated inside the service layer while serializers focus on request validation and response representation.

---

# Files Created

## Posts

```text
backend/apps/posts/

services/
    __init__.py
    featured_image.py

serializers/
    post_featured_image.py
    post_featured_image_mixin.py

upload_paths.py
validators.py
constants.py
```

---

# Files Modified

```text
backend/apps/posts/models.py
backend/apps/posts/views.py
backend/apps/posts/apps.py
backend/apps/posts/admin.py
backend/apps/posts/serializers/__init__.py
backend/apps/posts/serializers/post_list.py
backend/apps/posts/serializers/post_detail.py

backend/config/settings/base.py
backend/config/urls.py
```

Database migration:

```text
backend/apps/posts/migrations/
```

---

# Database Changes

Added one optional field to the Post model.

```text
featured_image
```

Characteristics:

- ImageField
- Optional
- UUID filename generation
- Date-based storage folders
- Backend validation
- Storage-provider independent

---

# API Endpoints

## Upload / Replace

```http
PUT /api/posts/{slug}/featured-image/
```

Authentication:

- Required

Permission:

- Post author only

Content-Type:

```text
multipart/form-data
```

Response:

```json
{
    "featured_image_url": "http://..."
}
```

---

## Remove

```http
DELETE /api/posts/{slug}/featured-image/
```

Authentication:

- Required

Permission:

- Post author only

Response:

```text
204 No Content
```

---

## Public Responses

The following APIs now include:

```text
featured_image_url
```

- Post List
- Post Detail
- Search Results

---

# Validation Strategy

Validation is performed in multiple layers.

## Core Validation

Applies to:

- Model validation
- Django Admin
- ModelForms
- Shell
- API uploads

Checks:

- File presence
- File size
- Extension
- Image decoding
- Image format
- Dimensions
- Pixel count
- Animation

---

## Upload Validation

Additionally validates:

- Declared MIME type
- MIME type matches actual image format

---

# Storage Strategy

Upload path format:

```text
posts/featured/YYYY/MM/<uuid>.<extension>
```

Benefits:

- No filename collisions
- No user-controlled filenames
- Chronological organization
- Cloud-storage compatible

---

# Service Layer Responsibilities

The Featured Image service handles:

- Initial upload
- Image replacement
- Image removal
- Audit updates
- Transaction handling
- Safe storage cleanup

The ViewSet contains no storage-specific business logic.

---

# Security

Implemented protections include:

- JWT authentication
- Object-level authorization
- Slug routing
- Backend-controlled file assignment
- UUID filenames
- MIME validation
- Extension validation
- Image verification
- Corruption detection
- Animation rejection
- Dimension limits
- Pixel-count limits
- Transaction-safe cleanup

---

# File Lifecycle

Upload

```text
Client
    │
    ▼
Validation
    │
    ▼
Storage
    │
    ▼
Database Update
```

Replacement

```text
Remember old file
        │
        ▼
Save new image
        │
        ▼
Commit transaction
        │
        ▼
Delete old file
```

Removal

```text
Remove database reference
        │
        ▼
Commit transaction
        │
        ▼
Delete physical file
```

Soft deletion preserves images.

Physical deletion removes images after database commit.

---

# Manual Testing Coverage

The following scenarios were manually verified:

## Upload

- Successful JPEG upload
- Successful PNG upload
- Successful WebP upload

## Replacement

- Replace existing image
- Old file removed
- New file accessible

## Removal

- Delete image
- Repeated delete
- File removed from storage

## Authorization

- Anonymous upload denied
- Non-author upload denied
- Non-author delete denied

## Validation

- Missing image
- Empty file
- Invalid extension
- Invalid MIME type
- Corrupted image
- Extension mismatch
- MIME mismatch
- Oversized file
- Oversized dimensions
- Excessive pixel count
- Animated image rejection

## Public APIs

- List includes image URL
- Detail includes image URL
- Search includes image URL
- Null returned when no image exists

---

# Key Concepts Learned

- Django ImageField
- Django Storage API
- Upload path generation
- UUID filenames
- File validation
- Pillow image inspection
- MIME validation
- Transaction management
- transaction.on_commit()
- Multipart uploads
- DRF FileField
- SerializerMethodField
- Service Layer pattern
- Storage abstraction

---

# Interview Questions

- Why use UUID filenames instead of user filenames?
- Why validate both MIME type and actual image format?
- Why use transaction.on_commit() when deleting files?
- Why isolate upload logic inside a service layer?
- Why expose URLs instead of storage paths?
- Why preserve images during soft deletion?
- Why use multipart/form-data for uploads?
- How does Django Storage API support cloud providers?

---

# Common Mistakes Prevented

- Trusting filename extensions
- Trusting MIME types alone
- Using original filenames
- Deleting files before database commit
- Placing business logic inside serializers
- Performing storage operations inside views
- Using filesystem-specific APIs
- Allowing unauthorized uploads
- Returning storage paths to clients

---

# Refactoring Opportunities

Future enhancements may include:

- Automatic thumbnail generation
- Responsive image variants
- Background image optimization
- CDN integration
- Signed URLs for private media
- Multiple image attachments
- Image metadata extraction
- Virus scanning
- Asynchronous processing

---

# Documentation Updates

## New Documents

- ADR-017 — Featured Image Architecture
- Feature-13 — Media Uploads

## Updated Documents

- Project-Status.md
- README.md (only if media uploads are documented)

---

# Project State

Completed Features:

- Feature 00 — Project Dashboard
- Feature 01 — Project Foundation
- Feature 02 — Custom User Model
- Feature 03 — JWT Authentication
- Feature 04 — Posts
- Feature 05 — Publishing Workflow
- Feature 06 — Categories
- Feature 07 — Tags
- Feature 08 — Post–Category Relationship
- Feature 09 — Post–Tag Relationship
- Feature 10 — Comments
- Feature 11 — User Profiles
- Feature 12 — Search
- Feature 13 — Media Uploads

Current Status:

- Feature 13 implementation completed
- Manual testing completed
- Documentation in progress

Next Feature:

- Feature 14 — Permissions & Authorization

---

# Feature Completion

Feature 13 successfully introduces production-ready featured image support while maintaining the project's architecture-first, security-first, and scalability-focused engineering standards.