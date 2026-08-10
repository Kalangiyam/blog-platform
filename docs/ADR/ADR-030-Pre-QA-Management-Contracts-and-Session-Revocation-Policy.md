# ADR-030: Pre-QA Management Contracts and Session Revocation Policy

## Status

Accepted

## Date

2026-08-10

## Context

Post-completion review of Frontend Features 10 and 11 identified three contract and security defects:

1. The Editor moderation UI deleted Comments through the public owner-only endpoint, so an Editor could not moderate another User's Comment.
2. Post Edit retrieved unpublished Posts by sending an empty PATCH, which changed `updated_by` and `updated_at` while loading the page.
3. Password change/reset silently ignored refresh-token revocation failures and could return success after committing a password while old refresh sessions remained usable.

The existing architecture already provides a collision-free `/api/editorial/` namespace, independent Author/Editor/Administrator roles, shared soft-delete behavior, Simple JWT outstanding/blacklist tables, and account-security service functions.

## Decision

### Explicit Editorial Contracts

- Add Editor-only `DELETE /api/editorial/comments/{id}/`.
- Preserve public `DELETE /api/comments/{id}/` as authenticated-owner-only.
- Attribute moderation deletion with `Comment.delete(user=request.user)`.
- Treat repeat editorial deletion as idempotent `204` because the editorial queryset and shared soft-delete operation can resolve and safely no-op an already-deleted Comment.
- Add `GET /api/editorial/posts/{slug}/` as the read-only management-detail contract.
- Authors retrieve only their own active Posts; Editors retrieve any active Post; Administrator alone grants no editorial authority.
- Soft-deleted Posts return `404` from management detail and remain available only through the existing Editor restoration lifecycle.
- Keep editorial list filters action-specific so they do not constrain retrieve or restore.
- Reuse the read-only `PostDetailSerializer` rather than duplicate its safe field representation.

### Transactional Fail-Closed Session Revocation

- Password mutation and refresh-token blacklist writes processed by the operation share one `transaction.atomic()` boundary.
- The account-security service raises the application-level `SessionRevocationError` when revocation fails.
- DRF views translate that exception to a generic `503 Service Unavailable` response.
- Revocation failures are logged with safe context: event, operation, and User ID. No credential or token material is logged explicitly or returned.
- The password and any partial blacklist rows roll back together on failure.

The guarantee is deliberately bounded. Refresh-token blacklisting does not revoke already-issued access tokens; the configured 15-minute access-token lifetime is unchanged. A narrow concurrent refresh-token issuance race can remain. Immediate access-token invalidation, session versioning, token denylisting, and schema changes are outside this milestone.

## Consequences

### Advantages

- Public owner contracts stay narrow and backward compatible.
- Editorial authority is explicit, backend-enforced, and independent of Administrator authority.
- Post Edit loading is a true read and preserves audit integrity.
- Comment deletion and restoration form a coherent audited lifecycle.
- Credential changes cannot report success after a revocation failure.
- Password-reset failures remain safely retryable after rollback.
- No model, migration, index, or JWT lifetime change is required.

### Trade-offs

- Temporary blacklist-table failure blocks password change/reset.
- Existing access tokens remain valid until natural expiry.
- Revocation cost remains proportional to the User's outstanding refresh-token count.
- Removing the concurrent issuance race requires a broader authentication redesign.

## Alternatives Rejected

- **Editor override on the public Comment endpoint:** rejected because it weakens the owner-oriented public contract.
- **Custom POST delete action:** rejected because standard DELETE detail semantics fit the existing DRF router and lifecycle.
- **Public Post detail expansion:** rejected because unpublished management data must remain outside the public visibility boundary.
- **Dedicated management serializer:** rejected because `PostDetailSerializer` already provides the complete safe read representation.
- **Password commit plus revocation error:** rejected because it creates ambiguous client state.
- **Best-effort revocation:** rejected because it silently preserves old refresh sessions.
- **Session versioning/access-token denylisting:** deferred because it requires a broader token and persistence architecture.

## Relationship to ADR-029

ADR-029 remains the historical Feature 11 architecture record. ADR-030 prospectively extends its editorial namespace and qualifies its session-revocation guarantee with explicit failure, transaction, access-token, and concurrency semantics.

## Verification

Backend tests cover permission matrices, audit attribution, deletion/restoration, active/deleted Post boundaries, no-mutation GET, blacklist state, old-refresh rejection, partial failure rollback, reset retry, safe `503`, fresh login, and residual access-token validity.

Frontend tests cover the exact editorial paths, authoritative moderation refetch, removal of the initial PATCH fallback, controlled errors, and no logout after a rolled-back password change.

On 2026-08-10, the Django check passed with 0 issues; all 126 backend tests passed with 0 failures and 0 errors; all 92 frontend test files and 494 tests passed with 0 failures; ESLint passed with 0 errors and 0 warnings; the production build passed with 277 modules transformed; and `git diff --check` passed.

The live-stack manual result was **PASS WITH NON-BLOCKING ENVIRONMENT LIMITATION**. Editorial moderation/audit/restore, management-detail role and deletion boundaries, zero-PATCH Post Edit loading, deliberate updates, password-change/logout/credential behavior, and authentication/session/navigation smoke scenarios passed. Manual password-reset email delivery was not completed because no SMTP service was listening at `127.0.0.1:25`; the local endpoint returned `500` with `ConnectionRefusedError` (WinError 10061). Automated reset/token/revocation coverage remains green. This is an environment/deployment limitation on current evidence, not an application defect; real provider configuration and end-to-end delivery verification remain production work.
