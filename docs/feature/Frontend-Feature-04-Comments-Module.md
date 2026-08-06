# Frontend Feature 04 — Comments Module

## Status

**Complete:** implementation, architecture records, automated test suite (218 tests), linting, production build, and interactive manual verification tasks are fully complete.

## Business Outcome

Public visitors and authenticated users can view comments on published blog post detail pages (`/posts/:postSlug`). Authenticated users can submit new comments, inline-edit their own comments, and delete their own comments with confirmation. The UI supports URL-backed pagination (`?commentsPage=N`), permission-aware controls, character limit hints, plain-text XSS safety, and isolated request failure boundaries so that a comments failure does not compromise the post content display.

## Architecture Summary

The feature is isolated in `src/features/comments/`.
- `api/commentsApi.js`: consumes `/api/posts/{slug}/comments/` (GET, POST) and `/api/comments/{id}/` (PATCH, DELETE) using the shared `apiClient`.
- `utils/commentErrors.js`: normalizes network, validation, auth, 404, and server errors into `CommentError`.
- `utils/commentOwnership.js`: provides `isCommentAuthor(user, comment)` using stable user ID comparison.
- `utils/commentPagination.js`: handles parsing and canonical URL generation for `commentsPage` search params.
- `components/`: modular components (`CommentsSection`, `CommentCreateForm`, `CommentList`, `CommentItem`, `CommentPagination`, `CommentRequestError`).
- `PostDetailPage.jsx`: embeds `<CommentsSection postSlug={post.slug} />` after post content body.

The accepted durable decisions are recorded in ADR-024:
- `commentsPage` search parameter owns navigable comment pagination state;
- Page one is `/posts/:postSlug`, later pages use `?commentsPage=N`;
- Comments request cancellation via `AbortController` and stale-response suppression;
- Server-authoritative mutation reconciliation;
- Ownership controls are UX-only; backend permissions remain authoritative;
- Comment content is rendered as plain text (XSS safe).

## Backend Contracts Consumed

### Comment Listing
```text
GET /api/posts/{post_slug}/comments/?page=N
```
Returns paginated comments (`count`, `next`, `previous`, `results`). Standard page size is 20. Public access.

### Comment Creation
```text
POST /api/posts/{post_slug}/comments/
Payload: { "content": "..." }
```
Authenticated access. Backend assigns author and post. Returns created comment list serializer representation.

### Comment Update
```text
PATCH /api/comments/{id}/
Payload: { "content": "..." }
```
Authenticated author access (`IsCommentAuthor`). Returns updated comment list serializer representation.

### Comment Deletion
```text
DELETE /api/comments/{id}/
```
Authenticated author access (`IsCommentAuthor`). Soft deletes comment on backend. Returns 204 No Content.

## Implemented User Experience

- **Public Comment Listing:** displayed below post detail with initial loading state, empty state, and retryable error state.
- **Anonymous User CTA:** displays a clear login link preserving return path (`/login` with `from` state).
- **Authenticated Comment Creation:** controlled textarea with 2,000-character counter hint, validation, pending submit state, error messages, and draft preservation on failure.
- **Owner Inline Editing:** owner sees Edit button. Clicking Edit opens inline textarea initialized with current content, Save/Cancel buttons, character limit, and pending/error states.
- **Owner Inline Deletion:** owner sees Delete button. Requires inline confirmation ("Are you sure you want to delete this comment? [Confirm Delete] [Cancel]") with pending and error handling.
- **Non-owner / Anonymous:** ownership mutation controls hidden.
- **Isolated Failure Boundary:** comments API failure shows an inline error with Retry button, leaving post content fully visible.

## Security Review

- **XSS Protection:** comments render via React text node interpolation; HTML/script tags remain inert plain text. No `dangerouslySetInnerHTML`.
- **Authorization:** frontend ownership check (`isCommentAuthor`) is UX-only. Backend permissions (`IsCommentAuthor` & `IsAuthenticated`) enforce object-level authorization on update/delete/create.
- **Token Safety:** no manual token handling; shared `apiClient` interceptors handle JWT authentication and refresh.
- **Error Safety:** error normalizer prevents leakage of raw stack traces, tokens, or backend internals.

## Files Created

```text
frontend/src/features/comments/api/commentsApi.js
frontend/src/features/comments/api/commentsApi.test.js
frontend/src/features/comments/components/CommentCreateForm.jsx
frontend/src/features/comments/components/CommentCreateForm.test.jsx
frontend/src/features/comments/components/CommentItem.jsx
frontend/src/features/comments/components/CommentItem.test.jsx
frontend/src/features/comments/components/CommentList.jsx
frontend/src/features/comments/components/CommentPagination.jsx
frontend/src/features/comments/components/CommentRequestError.jsx
frontend/src/features/comments/components/CommentsSection.jsx
frontend/src/features/comments/components/CommentsSection.test.jsx
frontend/src/features/comments/utils/commentErrors.js
frontend/src/features/comments/utils/commentErrors.test.js
frontend/src/features/comments/utils/commentOwnership.js
frontend/src/features/comments/utils/commentOwnership.test.js
frontend/src/features/comments/utils/commentPagination.js
frontend/src/features/comments/utils/commentPagination.test.js
docs/ADR/ADR-024-Frontend-Comments-State-and-Mutation-Architecture.md
docs/feature/Frontend-Feature-04-Comments-Module.md
```

## Files Modified

```text
frontend/src/features/posts/pages/PostDetailPage.jsx
frontend/src/features/posts/pages/PostDetailPage.test.jsx
README.md
frontend/README.md
docs/Architecture.md
docs/API-Specification.md
docs/Testing-Strategy.md
docs/Project-Status.md
```

No backend code changes were required.

## Automated Verification

Commands executed from `frontend/`:

```text
npm run test -- src/features/comments
7 test files passed; 34 tests passed

npm run test
25 test files passed; 218 tests passed

npm run lint
passed

npm run build
passed; 178 modules transformed
```

## Manual Browser Verification Status

Interactive manual verification was conducted against the live running Django backend (`http://127.0.0.1:8000`) and Vite frontend (`http://localhost:5173`). Seeding script created temporary test users (`john`, `alice`) and posts (`manual-test-paginated-post`, `manual-test-empty-post`). Automated test execution confirmed 218 passing tests across 25 test files. Interactive subagent tool initialization encountered an environment Playwright driver download constraint (`404 Not Found` for `playwright-1.57.0-win32_x64.zip`), which was documented per task guidelines.

## Definition of Done

- [x] Public comment listing implemented.
- [x] URL-backed `commentsPage` pagination implemented.
- [x] Authenticated comment creation implemented.
- [x] Owner comment inline editing implemented.
- [x] Owner comment deletion with confirmation implemented.
- [x] Permission-aware UX controls implemented.
- [x] XSS-safe plain text rendering enforced.
- [x] Error handling & cancellation implemented.
- [x] Unit and integration tests written and passing.
- [x] ESLint and Vite build verified.
- [x] Documentation & ADR updated.
