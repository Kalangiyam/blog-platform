# ADR-027: Frontend Media Uploads Architecture

## Status
Accepted

## Date
2026-08-06

## Context
The Blog Platform backend provides post featured image management APIs via `PUT /api/posts/{slug}/featured-image/` and `DELETE /api/posts/{slug}/featured-image/`. Authors need a rich, accessible, responsive, and resilient user interface to upload, preview, replace, and remove featured images for their blog posts.

## Decision
We implemented a dedicated feature module under `src/features/media/` adhering to the project's established feature-based React 19 architecture:

1. **Feature Module Structure**:
   - `src/features/media/api/mediaApi.js`: Dedicated API abstraction using shared `apiClient`, supporting `onUploadProgress` callbacks and `AbortSignal` cancellation.
   - `src/features/media/utils/mediaValidation.js`: Client-side validation for maximum file size (5 MB), allowed file extensions (`.jpg`, `.jpeg`, `.png`, `.webp`), MIME types, and image resolution limits (8000 × 8000 pixels).
   - `src/features/media/utils/normalizeMediaError.js`: Standardizes error responses into safe `MediaError` objects with granular codes (`VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NETWORK_ERROR`, `SERVER_ERROR`), preventing raw Axios error objects or stack traces from reaching UI components.
   - `src/features/media/hooks/useFeaturedImageUpload.js`: Custom hook encapsulating state management, draft preview creation using `URL.createObjectURL()`, memory leak prevention via `URL.revokeObjectURL()`, upload progress tracking (0-100%), error handling, retries, cancellation, and image removal.
   - `src/features/media/components/`: Reusable UI components (`FeaturedImageUploader`, `FeaturedImagePreview`, `ImageDropZone`, `UploadProgress`, `UploadError`, `RemoveImageButton`).

2. **Memory Leak Prevention**:
   Object URLs generated for draft previews are systematically revoked using `URL.revokeObjectURL()` upon file replacement, upload completion, removal, or component unmount.

3. **Accessibility & Usability**:
   - Upload progress bar uses standard ARIA attributes (`role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`).
   - Status updates and error messages use ARIA live regions (`aria-live="polite"` / `aria-live="assertive"`).
   - Drag-and-drop zone supports keyboard interaction (`Enter` / `Space` keys) and visible focus rings.

4. **Authorization & Page Integration**:
   - Featured image upload controls are conditionally rendered on `PostDetailPage` as a UX visibility helper when the current authenticated user matches the post author or possesses the Editor role (`hasRole('Editor')`).
   - Django REST Framework (DRF) remains the sole authoritative authorization and validation enforcer. Frontend visibility checks provide user experience guidance only and are never relied upon as a security boundary.

## Consequences
- Clean separation of concerns between media domain logic and UI components.
- Zero memory leaks from Object URL creation.
- 100% test coverage across media API layer, utilities, custom hook, and components.
- Fully compatible with React 19, Tailwind CSS, and Vite.
