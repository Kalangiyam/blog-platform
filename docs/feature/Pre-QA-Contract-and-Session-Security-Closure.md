# Pre-QA Contract and Session Security Closure

## Completion Status

Completed on 2026-08-10. Automated verification passed, and the manual/full-stack result was **PASS WITH NON-BLOCKING ENVIRONMENT LIMITATION**.

## Objective

Close the confirmed Editor comment-deletion, unpublished Post retrieval, and refresh-token revocation failure-policy defects before final browser QA and production hardening.

## Delivered Contracts

### Editor Comment Moderation

```http
DELETE /api/editorial/comments/{id}/
```

- Requires JWT authentication and the Editor role.
- Soft-deletes through the shared model lifecycle.
- Records the acting Editor in `deleted_by` and sets `deleted_at`.
- Does not change `updated_at` or `updated_by`.
- Returns idempotent `204` for an already-deleted Comment and `404` for an unknown ID.
- Preserves public `/api/comments/{id}/` deletion as owner-only.
- Remains compatible with the existing editorial restore action.

### Read-Only Post Management Detail

```http
GET /api/editorial/posts/{slug}/
```

- Authors retrieve only their own active draft/published Posts.
- Editors retrieve any active draft/published Post.
- Administrator-only and anonymous users are denied.
- Soft-deleted Posts return `404`; Editor restore remains separate.
- List-only filters do not affect retrieve or restore.
- Reuses `PostDetailSerializer`.
- Post Edit uses this GET directly and performs no initial PATCH.

### Transactional Session Revocation

Password change and password-reset confirmation now process password mutation and outstanding-refresh-token blacklisting inside one transaction. Revocation failure:

- raises `SessionRevocationError` in the service layer;
- logs safe event, operation, and User context;
- rolls back the password and all partial blacklist writes;
- is mapped by the DRF view to `503 Service Unavailable` with a generic response;
- does not trigger frontend logout after a failed password change.

Successful operations blacklist existing outstanding refresh tokens, make old refresh attempts fail, and allow a new login with the new password.

## Security Boundaries

Roles remain independent: Administrator does not imply Editor. Backend permissions remain authoritative.

The configured access-token lifetime remains 15 minutes. Already-issued access tokens are not invalidated by refresh-token blacklisting and remain valid until expiry. A narrow concurrent refresh-token issuance race remains; session versioning, access-token denylisting, and schema changes were deliberately excluded.

No passwords, raw tokens, reset tokens, JTIs, database details, exception messages, or stack traces are exposed through the `503` response.

## Files Changed

Backend implementation and tests:

- `backend/apps/editorial/__init__.py`
- `backend/apps/editorial/tests/__init__.py`
- `backend/apps/editorial/views.py`
- `backend/apps/editorial/tests/test_comment_moderation.py`
- `backend/apps/editorial/tests/test_editorial_posts.py`
- `backend/apps/comments/tests.py`
- `backend/apps/users/services/account_security.py`
- `backend/apps/users/views/account_security.py`
- `backend/apps/users/tests/test_account_security.py`

Frontend implementation and tests:

- `frontend/src/features/moderation/api/moderationApi.js`
- `frontend/src/features/moderation/api/moderationApi.test.js`
- `frontend/src/features/moderation/hooks/useCommentModeration.test.jsx`
- `frontend/src/features/posts/api/postsApi.js`
- `frontend/src/features/posts/api/postsApi.test.js`
- `frontend/src/features/posts/pages/PostEditPage.jsx`
- `frontend/src/features/posts/pages/PostEditPage.test.jsx`
- `frontend/src/features/posts/utils/postUtils.test.js`
- `frontend/src/features/account/api/accountSecurityApi.test.js`
- `frontend/src/features/account/hooks/useAccountSecurity.test.jsx`

Documentation:

- `docs/Project-Status.md`
- `docs/API-Specification.md`
- `docs/Architecture.md`
- `docs/Authentication-Flow.md`
- `docs/Testing-Strategy.md`
- dated corrections in the Frontend Feature 10 and 11 reports
- `docs/ADR/ADR-030-Pre-QA-Management-Contracts-and-Session-Revocation-Policy.md`
- this completion report

No models, migrations, indexes, JWT lifetimes, or role semantics changed.

## Verification Results

### Targeted backend

- Stage A: 12 Comment/editorial tests passed.
- Stage B: 16 editorial Post tests passed.
- Stage C: 12 account-security/JWT lifecycle tests passed.

### Complete backend

```text
python manage.py check
System check identified no issues (0 silenced).

python manage.py test --verbosity 1 --noinput
Found 126 tests.
Ran 126 tests in 361.994s.
OK
```

Django created, migrated, and destroyed the isolated `test_blog_platform` database.

### Frontend

```text
Targeted contract suites: 7 files, 37 tests passed.
Full Vitest suite: 92 files, 494 tests passed.
ESLint: passed with 0 errors and 0 warnings.
Production build: passed; 277 modules transformed.
git diff --check: passed.
```

Vite emitted its existing non-blocking advisory for a main JavaScript chunk above 500 kB.

## Manual QA

**Overall result: PASS WITH NON-BLOCKING ENVIRONMENT LIMITATION.** This is not an unconditional manual-QA pass.

Verified against the live frontend/backend stack:

- Editor deletion of another User's Comment through `/api/editorial/comments/{id}/`, acting-Editor `deleted_by` attribution, removal from the public listing, retrieval through the deleted filter, and restoration;
- Administrator-only denial of moderation authority and preservation of owner-only deletion through `/api/comments/{id}/`;
- Author retrieval of their own management Posts, denial for another Author's draft, Editor retrieval of another Author's active draft, Administrator-only denial, and soft-deleted management-detail `404`;
- zero PATCH requests during initial Post Edit loading and successful deliberate Post updates;
- successful password change, logout after success, old-credential rejection, new-credential acceptance, invalid-current-password rejection, and confirmation-mismatch rejection;
- authentication/session/navigation and the broader Home/filtering, Post Detail, search, profiles, Administrator User Creation, and responsive-layout smoke scenarios.

No application defect was identified by the manual/full-stack run.

### Password-Reset Email Limitation

Manual password-reset email delivery was not completed. The observed local request returned:

```text
POST /api/auth/password/reset/
→ 500 Internal Server Error
```

The observed cause was `ConnectionRefusedError` (WinError 10061): no SMTP server was running at `127.0.0.1:25`. Automated password-reset, token, rollback, and revocation tests remain green. Current evidence classifies the missing SMTP service as a local-development environment limitation rather than an application defect. Real email-provider configuration and end-to-end delivery verification remain production/deployment work. Graceful handling of mail-provider outages may be reviewed separately during production hardening.

## Remaining Work

The Pre-QA closure is complete, but the overall project is **NOT PRODUCTION READY**. Remaining work includes real email delivery configuration and verification, broader out-of-scope documentation reconciliation, production hosts/origins, HTTPS and security headers, static/media strategy, a production WSGI server and reverse proxy, logging/observability, health checks, secrets management, backup/restore and rollback procedures, Docker/Compose, CI/CD, deployment documentation, and production-environment smoke verification.

## Git Scope During QA

Before QA, the working tree contained the approved existing Pre-QA implementation and documentation changes.

After QA, manual QA introduced no additional application source or documentation changes.

## Architectural Record

ADR-030 records the dedicated editorial contracts, read/write boundary, service/HTTP exception separation, transactional fail-closed policy, and bounded token guarantees. ADR-029 remains unchanged as the historical Feature 11 record.
