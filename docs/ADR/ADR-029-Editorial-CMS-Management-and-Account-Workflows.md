# ADR-029: Editorial CMS Management and Account Security Architecture

## Status
Accepted

## Context
Frontend Feature 11 requires adding an Editorial CMS Management workspace (Post management, Category/Tag management, Comment moderation) and Account Security workflows (Password change, Password reset, Email verification).

Key architectural concerns:
1. Public slug collision risk if management collections were mounted under `/api/posts/management/` or `/api/categories/management/` (since `management` can be a valid slug).
2. Distinction between public collections (`/api/posts/`, `/api/categories/`, `/api/tags/`, `/api/posts/{post_slug}/comments/`) and management collections (`/api/editorial/*`).
3. Dedicated token purpose isolation between Password Reset (`PasswordResetTokenGenerator`) and Email Verification (`EmailVerificationTokenGenerator` with `TimestampSigner`).
4. Account security requirement to revoke all Simple JWT refresh tokens on password change or reset.
5. Idempotent restoration logic and constraint enforcement (e.g. rejecting comment restoration if parent post is soft-deleted).

## Decision
1. **Dedicated Editorial API Namespace (`/api/editorial/`)**:
   Created `apps.editorial` as an orchestration and API viewset layer mounting `/api/editorial/posts/`, `/api/editorial/categories/`, `/api/editorial/tags/`, and `/api/editorial/comments/`.
2. **Preserve Public Endpoint Contracts**:
   Public `/api/posts/`, `/api/categories/`, `/api/tags/`, and `/api/posts/{post_slug}/comments/` remain active/published-only and unchanged.
3. **Role Isolation**:
   - Authors access only their own posts in `/api/editorial/posts/`.
   - Editors access all posts, taxonomy management (`Category.all_objects`, `Tag.all_objects`), comment moderation, and content restoration.
   - Administrators without the Editor role are denied access to editorial management routes (`403 Forbidden`).
4. **Isolated Token Architecture**:
   - Email verification uses `EmailVerificationTokenGenerator` using `TimestampSigner(salt="apps.users.tokens.EmailVerificationTokenGenerator")` and `EMAIL_VERIFICATION_TIMEOUT`. Cross-purpose tokens between password reset and email verification are rejected.
5. **Session Revocation**:
   - Password change and reset confirmation invoke `revoke_user_outstanding_tokens(user)` blacklisting outstanding Simple JWT refresh tokens and requiring fresh frontend authentication.

## Consequences
- Clean separation between public read views and role-scoped management workspaces.
- Elimination of slug collision vulnerabilities.
- Complete auditability and security compliance for account modification workflows.
