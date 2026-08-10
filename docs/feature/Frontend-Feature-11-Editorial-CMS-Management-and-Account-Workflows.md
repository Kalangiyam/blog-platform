# Frontend Feature 11 — Editorial CMS Management & Account Workflows

## 1. Feature Summary
Frontend Feature 11 delivers an enterprise-grade Editorial CMS Management workspace (`/dashboard/`) and comprehensive Account Security workflows. It enables Authors and Editors to manage blog posts, taxonomy categories, tags, and comment moderation through a dedicated `/api/editorial/` backend namespace, while empowering all platform users to manage password security, email verification status, and password resets safely.

## 2. Business Purpose
- **Editorial Control**: Grants Editors complete administrative oversight over published content, taxonomy availability, soft-deleted posts, and user comments without exposing management endpoints to public visitors.
- **Account Security**: Protects user accounts with token-isolated password reset, email verification, session revocation on security events, and rate throttling to prevent brute-force attacks and account enumeration.

## 3. Architecture Summary
- **Backend**: `apps.editorial` is built as an API orchestration layer (not a duplicate domain model) re-using existing models (`Post`, `Category`, `Tag`, `Comment`). Dedicated token generation (`EmailVerificationTokenGenerator` with `TimestampSigner`) isolates email verification from Django's `PasswordResetTokenGenerator`.
- **Frontend**: Modular React architecture (`features/dashboard/`, `features/taxonomies/`, `features/moderation/`, `features/account/`) using React Router 7, Axios API integration, custom hooks with `AbortController` cancellation, and Tailwind CSS UI controls.

## 4. Editorial Namespace
Mounted under `/api/editorial/`:
- `GET /api/editorial/posts/`
- `POST /api/editorial/posts/{slug}/restore/`
- `GET, POST /api/editorial/categories/`
- `GET, PATCH /api/editorial/categories/{slug}/`
- `GET, POST /api/editorial/tags/`
- `GET, PATCH /api/editorial/tags/{slug}/`
- `GET /api/editorial/comments/`
- `POST /api/editorial/comments/{id}/restore/`

## 5. Frontend Architecture
- `features/dashboard/`: Tabbed `DashboardLayout`, `useEditorialPosts` hook, `EditorialPostTable`, `EditorialPostsPage`.
- `features/taxonomies/`: `useTaxonomyManagement` hook, `TaxonomyTable`, `TaxonomyFormModal`, `CategoryManagementPage`, `TagManagementPage`.
- `features/moderation/`: `useCommentModeration` hook, `CommentModerationTable`, `CommentModerationPage`.
- `features/account/`: `useAccountSecurity` hook, `PasswordChangePage`, `EmailVerificationPage`, `ForgotPasswordPage`, `PasswordResetPage`, `EmailVerifyConfirmPage`.

## 6. Account-Security Architecture
- `is_email_verified`: Boolean field on `User` model, exposed in `/api/auth/me/`. Unverified users can log in, but can resend verification links via `/account/security/email`.
- Password change and reset confirmation call `revoke_user_outstanding_tokens(user)` to blacklist all Simple JWT outstanding refresh tokens.

## 7. Request / Response / Data Flow
- **Request Flow**: Client sends request with JWT Bearer header -> DRF authentication & permission guards -> Service layer -> DB Query (`all_objects` or `with_deleted`) -> Serializer -> Client response.
- **Response Flow**: Standard DRF JSON responses with paginated list formats (`count`, `next`, `previous`, `results`).
- **Data Flow**: Data mutations directly trigger refresh of list state via hook `reloadTrigger`.

## 8. Files Created & Modified

### Files Created
- `backend/apps/editorial/apps.py`, `serializers.py`, `views.py`, `urls.py`
- `backend/apps/users/migrations/0003_user_is_email_verified.py`
- `backend/apps/users/serializers/account_security.py`
- `backend/apps/users/services/account_security.py`
- `backend/apps/users/tokens.py`
- `backend/apps/users/views/account_security.py`
- `backend/apps/users/tests/test_account_security.py`
- `backend/apps/editorial/tests/test_editorial_posts.py`, `test_category_management.py`, `test_tag_management.py`, `test_comment_moderation.py`
- `frontend/src/features/dashboard/` (API, hooks, components, pages, tests)
- `frontend/src/features/taxonomies/` (API, hooks, components, pages, tests)
- `frontend/src/features/moderation/` (API, hooks, components, pages, tests)
- `frontend/src/features/account/` (API, hooks, components, pages, tests)
- `docs/feature/Frontend-Feature-11-Editorial-CMS-Management-and-Account-Workflows.md`
- `docs/ADR/ADR-029-Editorial-CMS-Management-and-Account-Workflows.md`

### Files Modified
- `backend/config/settings/base.py`
- `backend/config/urls.py`
- `backend/apps/users/models.py`
- `backend/apps/users/serializers/authentication.py`
- `backend/apps/users/urls.py`
- `frontend/src/routes/router.jsx`
- `frontend/src/features/auth/components/AuthNavigation.jsx`
- `docs/Project-Status.md`

## 9. Migration Strategy
Data migration `0003_user_is_email_verified.py` adds `is_email_verified` boolean field (`default=False`) and executes `RunPython` migration to set `is_email_verified = True` for all existing users. New users default to `False`.

## 10. Permissions Matrix
- **Anonymous**: Access to `/login`, `/forgot-password`, `/reset-password/:uid/:token`, `/verify-email/:uid/:token`.
- **Author**: Access to `/dashboard/posts` (own posts only), `/account/security/*`.
- **Editor**: Full access to `/dashboard/posts` (all posts), `/dashboard/categories`, `/dashboard/tags`, `/dashboard/comments`, content restoration, `/account/security/*`.
- **Administrator**: Access to `/admin/users`, `/account/security/*`. Must possess Editor role to access editorial management APIs.

## 11. Security Review
- **JWT Revocation**: Password change and reset confirmation invoke `revoke_user_outstanding_tokens(user)` blacklisting outstanding Simple JWT refresh tokens.
- **Account Enumeration Prevention**: Password reset endpoint returns generic 200 OK regardless of email existence. Inactive users do not receive reset links.
- **Token Isolation**: Separate token generators for password reset (`PasswordResetTokenGenerator`) and email verification (`EmailVerificationTokenGenerator` with `TimestampSigner`).
- **Throttling**: `password_reset` (5/hr per IP), `email_verify_send` (5/hr per user).

## 12. Testing Coverage & Results
- **Backend Unit Tests**: 26 passed (0 failures, 0 errors).
- **Frontend Vitest Suite**: 85+ test files passed (470+ tests passed).
- **ESLint**: 0 errors, 0 warnings.
- **Vite Build**: Production build succeeded.

## 13. Manual Testing Deferral
Manual Browser Verification:
Not performed for Frontend Feature 11 by explicit project decision.
Feature 11 completion is based on automated frontend and backend regression coverage, static analysis, production-build verification, Django system and migration checks, contract inspection, security review, accessibility-conscious source review, and final self-audit.
Manual browser verification is deferred to the final frontend QA and production-readiness phase.

## 14. Accessibility Considerations
- Focus management and keyboard navigation on form inputs and modals.
- Unique element IDs and explicit label pairings (`htmlFor`).
- WAI-ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).

## 15. Known Limitations
- Short-lived access tokens remain valid until their configured 15-minute expiration after password change. Refresh-token blacklisting does not invalidate already-issued access tokens.

## 16. Key Concepts & Interview Questions
- **Q**: Why create a dedicated `/api/editorial/` namespace instead of `/api/posts/management/`?
- **A**: Placing management under `/api/posts/management/` creates slug collisions if a post has the slug `management`. A dedicated namespace `/api/editorial/` completely eliminates routing ambiguity.

---

## Post-Completion Pre-QA Qualification — 2026-08-10

A later audit found that the Feature 11 moderation frontend called the public owner-only Comment delete endpoint and that refresh-token revocation silently swallowed failures. The Pre-QA Contract & Session Security Closure subsequently added:

- Editor-only `DELETE /api/editorial/comments/{id}/` with acting-Editor audit attribution;
- read-only `GET /api/editorial/posts/{slug}/` for active management Post loading;
- transactional fail-closed password mutation and refresh-token revocation;
- a safe generic `503` response when revocation fails;
- permission, lifecycle, no-mutation, blacklist, rollback, and frontend contract tests.

This qualification preserves Feature 11 as an accepted historical milestone while recording the later closure. The guarantee is bounded to password mutation and refresh-token revocation processed by the transaction. Already-issued access tokens remain valid for 15 minutes, and a narrow concurrent refresh-token issuance race remains outside this focused milestone. ADR-030 records the prospective policy.

## Post-Closure Manual QA Qualification — 2026-08-10

The later live-stack run verified Editor deletion of another User's Comment through the editorial contract, acting-Editor audit attribution, public disappearance, retrieval through the deleted filter, restoration, Administrator-only denial, and preservation of public owner-only deletion. It also verified the Post management-detail role matrix, deleted-Post `404`, zero-PATCH editor loading, successful deliberate updates, password change/logout behavior, old/new credential behavior, validation failures, and authentication/session/navigation smoke paths.

The overall result is **PASS WITH NON-BLOCKING ENVIRONMENT LIMITATION**. Manual password-reset email delivery was not completed because the local environment had no SMTP service at `127.0.0.1:25`; the reset request returned `500` with a `ConnectionRefusedError` (WinError 10061). Automated password-reset, token, rollback, and revocation tests remain green. This is recorded as an environment/deployment limitation rather than an application defect, and real provider configuration plus end-to-end delivery verification remain future production work.

This dated qualification does not rewrite Feature 11's historical test counts or its original manual-verification deferral. Author, Editor, and Administrator remain independent roles; Administrator does not imply Editor, and backend permissions remain authoritative.
