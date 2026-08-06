# ADR-024 — Frontend Comments State and Mutation Architecture

## Status

* **Status:** Accepted
* **Feature:** Frontend Feature 04 — Comments Module
* **Date:** 2026-08-06

---

# Context

The backend exposes comments APIs for published posts at `/api/posts/{post_slug}/comments/` (GET for public listing with DRF page-number pagination, POST for authenticated creation) and top-level comment APIs at `/api/comments/{id}/` (PATCH for author-owned inline edit, DELETE for author-owned soft delete).

The Comments module must integrate into the existing post detail view (`/posts/:postSlug`) without adding global context, custom state libraries, or secondary Axios clients, while maintaining URL-backed pagination, permission-aware UX, XSS safety, and isolated request failure boundaries.

# Decision

## Feature Boundary & Structure

Comments logic is located in `src/features/comments/` across `api/`, `components/`, and `utils/`. The module uses the shared `apiClient` instance and the central AuthContext for session state. `<CommentsSection>` is mounted in `PostDetailPage` below post content body.

## URL-Backed Comments Pagination

Comment pagination uses the `commentsPage` search parameter on the Post detail route (e.g. `/posts/example-post?commentsPage=2`). Canonical page 1 omits `commentsPage`. Invalid, negative, zero, non-numeric, or out-of-range parameters normalize safely to page 1.

## Local Abortable List State & Stale Response Protection

List requests use `AbortController` and `active` lifecycle flags. Cleanup aborts obsolete requests during unmount or page/slug transitions. A comments API failure displays an isolated inline error with a Retry control, leaving the post detail content fully rendered.

## Permission-Aware Frontend UX & Backend Authorization Authority

Ownership controls (Edit and Delete buttons) are rendered only when `isCommentAuthor(user, comment)` evaluates to true using stable numeric ID comparison (`Number(user.id) === Number(comment.author.id)`). Ownership checks on the frontend are UX-only; backend permissions (`IsCommentAuthor` and `IsAuthenticated`) remain the sole authorization authority.

## Server-Authoritative Mutation Reconciliation

Mutations (Create, Update, Delete) are server-authoritative. Optimistic UI mutations are avoided.
- **Create:** On success, if viewing page 1 and results count < 20, the server-returned comment representation is appended to the list and total count is incremented.
- **Update:** On success, the matching comment in local state is replaced by the server-returned representation.
- **Delete:** On success, the comment is removed from local state. If the current page becomes empty and page > 1, the component automatically navigates to `commentsPage = page - 1`.

## XSS Safety & Error Handling

Comment content is rendered using standard React text interpolation and CSS `whitespace-pre-wrap` / `break-words`. `dangerouslySetInnerHTML` is prohibited. Error responses are normalized into standard `CommentError` objects without exposing raw Axios objects or sensitive backend traces.

# Alternatives Considered

## Global Comments Context or Cache Library

Rejected because comments are localized to the Post detail view and do not require cross-screen state sharing. Adding TanStack Query or Redux would violate project architectural constraints.

## Standalone Comments Route (`/posts/:postSlug/comments`)

Rejected because comments belong inline below the blog post content as specified by product requirements and UX guidelines.

## Optimistic Comment Creation / Deletion

Rejected because server-authoritative responses guarantee correct ID, timestamp, author attribution, and backend soft-delete status without complex rollbacks upon server rejection.

# Consequences

## Advantages

- Public visitors can view comments while authenticated users can interact safely.
- URL-backed pagination preserves browser back/forward and refresh state.
- Post detail view remains functional even if comments fail to load.
- Plain-text rendering eliminates XSS vulnerabilities.
- Code is modular, easily tested, and fully aligned with existing project architecture.

## Trade-offs

- Re-visiting a comments page re-fetches from the API because no persistent global client cache is maintained.
- Inline edit and delete controls rely on backend enforcement for strict security.

# Verification

Feature 04 introduces 32 automated tests covering error normalization, ownership checks, URL pagination, API methods, form controls, comment item inline edit/delete, and section integration. The full frontend test suite passes (198 tests across 23 files); ESLint and production Vite build pass cleanly.
