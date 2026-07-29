# ADR-017 — Featured Image Architecture

## Status

- **Status:** Accepted
- **Date:** 2026-07-29
- **Feature:** Feature 13 — Media Uploads

---

# Context

Feature 13 introduces featured image support for blog posts.

The application requires authors to upload, replace, retrieve, and remove a single featured image associated with a post while maintaining production-grade security, scalability, and storage independence.

The solution needed to satisfy the following business requirements:

- Each Post can have one optional featured image.
- Images must be securely uploaded by the Post author.
- Public APIs should expose an image URL for published posts.
- Uploads must support future cloud storage providers without code changes.
- Invalid or malicious files must be rejected before storage.
- Replacing an image must not leave orphaned files.
- Removing an image must safely delete the stored file.
- Soft-deleted Posts must retain their images for future restoration.
- Storage cleanup must remain transaction-safe.

---

# Decision

The Featured Image feature follows the architectural decisions described below.

---

## Store the Image on the Post Model

A single optional `ImageField` is stored directly on the `Post` model.

Benefits:

- Simple data model
- Efficient queries
- No unnecessary joins
- Easy serializer integration
- Fits the business requirement of one featured image per Post

---

## Dedicated Upload Path Generator

A dedicated upload-path function generates storage paths using:

- Year
- Month
- UUID filename

Example:

```text
posts/featured/2026/07/<uuid>.jpg
```

Benefits:

- Prevents filename collisions
- Removes user-controlled filenames
- Avoids path traversal attacks
- Organizes uploaded files chronologically

---

## Storage Abstraction

The implementation uses Django's Storage API instead of filesystem-specific operations.

Benefits:

- Compatible with local development storage
- Future-ready for AWS S3
- Future-ready for Cloudinary
- Future-ready for Azure Blob Storage
- No storage-specific application logic

---

## Layered Validation Strategy

Image validation is separated into reusable layers.

Model validation performs:

- File existence validation
- File size validation
- Extension validation
- Image decoding
- Format validation
- Dimension validation
- Pixel count validation
- Animation detection

API uploads additionally validate:

- Declared MIME type
- MIME type matches decoded image format

Benefits:

- Reusable validation
- Works in Django Admin
- Works in ModelForms
- Works in shell scripts
- Stronger HTTP upload protection

---

## Service Layer

Image upload, replacement, and removal are implemented inside a dedicated service module.

Responsibilities include:

- Assign uploaded images
- Replace existing images
- Remove images
- Update audit fields
- Coordinate database transactions
- Schedule storage cleanup after commit

Benefits:

- Thin ViewSet
- Clear separation of concerns
- Easier testing
- Reusable business logic

---

## Transaction-Safe Storage Cleanup

Replacing or removing an image deletes physical files only after the database transaction commits successfully.

The implementation uses:

```python
transaction.on_commit(...)
```

Benefits:

- Prevents broken database references
- Prevents premature file deletion
- Maintains database and storage consistency

---

## Dedicated Upload Endpoint

Featured image management is exposed through a dedicated nested resource.

Endpoints:

```text
PUT    /api/posts/{slug}/featured-image/
DELETE /api/posts/{slug}/featured-image/
```

Benefits:

- RESTful design
- Clear separation from Post content updates
- Supports multipart uploads
- Simplifies frontend integration

---

## Public Image Representation

Public Post serializers expose:

```text
featured_image_url
```

instead of the underlying storage path.

Benefits:

- Stable API contract
- Storage implementation remains internal
- Supports future CDN integration
- Absolute URLs simplify frontend rendering

---

## Security Model

Image management requires:

- JWT authentication
- Object-level ownership validation
- Slug-based routing
- Backend-controlled file assignment

Uploaded files are validated for:

- File size
- Extension
- MIME type
- Actual image format
- Corruption
- Animation
- Dimensions
- Pixel count

Benefits:

- Prevents malicious uploads
- Prevents IDOR attacks
- Prevents filename manipulation
- Protects storage resources

---

## Soft Delete Behavior

Soft-deleted Posts retain their featured images.

Benefits:

- Supports future restoration
- Preserves historical data
- Avoids accidental data loss

Physical storage cleanup occurs only when a Post is permanently deleted.

---

# Consequences

## Advantages

- Production-ready architecture
- Clear separation of responsibilities
- Storage-provider independence
- Transaction-safe file lifecycle
- Strong upload validation
- RESTful API design
- Reusable validation logic
- Future cloud-storage compatibility

---

## Trade-offs

- Additional service layer increases implementation complexity.
- Image validation performs multiple inspection steps using Pillow.
- Storage cleanup requires transaction coordination.
- Dedicated upload endpoints add additional API surface.

These trade-offs are acceptable because they improve maintainability, security, and long-term scalability.

---

# Alternatives Considered

## Separate Media Model

Rejected because:

- Adds unnecessary relationships
- Introduces additional joins
- More complex API design
- Not required for a single featured image

---

## Store User Filename

Rejected because:

- Filename collisions
- Information disclosure
- User-controlled paths
- Difficult cleanup

UUID-based filenames provide a safer and more scalable solution.

---

## Perform File Deletion Immediately

Rejected because:

- Database rollback could leave broken references
- Files may be deleted before transactions succeed

Using `transaction.on_commit()` ensures safe cleanup.

---

## Handle Upload Logic Inside the ViewSet

Rejected because:

- Violates Separation of Concerns
- Harder to test
- Harder to reuse
- Bloated ViewSet implementation

The service layer provides a cleaner architecture.

---

# References

- Feature 13 — Media Uploads
- Django Storage API
- Django REST Framework Serializers
- Django Transactions
- Pillow Image Validation