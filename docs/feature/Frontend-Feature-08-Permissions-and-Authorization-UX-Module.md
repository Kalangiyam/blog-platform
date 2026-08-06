# Frontend Feature 08 — Permissions & Authorization UX Module

## Feature Summary
Frontend Feature 08 implements a centralized, predictable, accessible, and reusable frontend authorization module (`frontend/src/features/permissions/`). It provides semantic role checking, resource ownership comparison, domain authorization rules, custom authorization hooks (`useAuthorization`, `useOwnership`), declarative permission rendering (`Can`), and controlled unauthorized/forbidden UI components (`ForbiddenState`, `AuthorizationMessage`).

The module is integrated across application navigation, post detail actions, comment item actions, profiles, and media management while strictly maintaining the Django REST Framework backend as the sole security authority.

---

## Business Purpose
Users receive a clear and transparent authorization experience where:
- Available actions are visibly accessible.
- Unavailable actions are hidden or clearly explained without dead clicks.
- Resource ownership rules (Author managing own post/comment) are respected.
- Role-based capabilities (Editor moderating content, Administrator managing users) are reflected in UI navigation.
- Multi-role users receive the union of their assigned capabilities.
- Server access denials (HTTP 403) display controlled, non-alarming forbidden states without forcing session logout.

---

## Architecture & Security Boundary
```text
Django REST Framework (Backend Security Authority)
    │ /api/auth/me/ (Roles: Author, Editor, Administrator)
    ▼
AuthProvider (Session State & Auth Status)
    │ currentUser
    ▼
frontend/src/features/permissions/
  ├── constants (APPLICATION_ROLES, PERMISSION_ACTIONS)
  ├── utils/roles.js (hasRole, hasAnyRole, isAuthor, isEditor, isAdministrator)
  ├── utils/ownership.js (isResourceOwner, isPostOwner, isCommentOwner, isProfileOwner)
  ├── utils/authorizationRules.js (canEditPost, canDeletePost, canPublishPost, canManageFeaturedImage, etc.)
  ├── hooks/useAuthorization.js & useOwnership.js
  ├── components/Can.jsx & ForbiddenState.jsx & AuthorizationMessage.jsx
  └── index.js
```

### Security Boundary Principles
- **Frontend Authorization**: UI prediction and presentation layer only.
- **Backend Authorization**: Absolute security authority. DRF permission classes (`IsPostAuthor`, `IsCommentAuthor`, `IsAuthor`, `IsEditor`, `IsAdministrator`) independently enforce every API call.

---

## Files Created & Modified

### Created Files
- `frontend/src/features/permissions/permissions.constants.js` — Role and action constants.
- `frontend/src/features/permissions/utils/roles.js` — Pure role utilities.
- `frontend/src/features/permissions/utils/roles.test.js` — Role utility unit tests.
- `frontend/src/features/permissions/utils/ownership.js` — Pure ownership helpers.
- `frontend/src/features/permissions/utils/ownership.test.js` — Ownership helper unit tests.
- `frontend/src/features/permissions/utils/authorizationRules.js` — Pure domain authorization rules.
- `frontend/src/features/permissions/utils/authorizationRules.test.js` — Domain authorization rules unit tests.
- `frontend/src/features/permissions/hooks/useAuthorization.js` — Unified authorization hook.
- `frontend/src/features/permissions/hooks/useAuthorization.test.jsx` — Hook unit tests.
- `frontend/src/features/permissions/hooks/useOwnership.js` — Ownership hook.
- `frontend/src/features/permissions/components/Can.jsx` — Declarative permission component.
- `frontend/src/features/permissions/components/Can.test.jsx` — Declarative component unit tests.
- `frontend/src/features/permissions/components/ForbiddenState.jsx` — Reusable 403 component.
- `frontend/src/features/permissions/components/ForbiddenState.test.jsx` — 403 component unit tests.
- `frontend/src/features/permissions/components/AuthorizationMessage.jsx` — Inline warning callout.
- `frontend/src/features/permissions/index.js` — Module entry point.
- `docs/ADR/ADR-028-Frontend-Permissions-and-Authorization-UX-Architecture.md` — ADR 028.

### Modified Files
- `frontend/src/features/auth/components/AuthNavigation.jsx` — Integrated permission-aware role badges and navigation.
- `frontend/src/features/posts/pages/PostDetailPage.jsx` — Integrated permission-aware post management toolbar.
- `frontend/src/features/comments/components/CommentItem.jsx` — Integrated permissions module for comment author controls.
- `frontend/src/features/auth/pages/UnauthorizedPage.jsx` — Updated to utilize `ForbiddenState`.
- `docs/Project-Status.md` — Synchronized project status.

---

## Authorization UX Matrix

| User Profile | Public Posts | Post Edit / Delete / Featured Image | Create Post | Comment Edit / Delete | Category / Tag Admin | User Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Anonymous** | ✅ Read | ❌ Hidden | ❌ Hidden (Prompt Login) | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| **Author (Owner)** | ✅ Read | ✅ Visible | ✅ Visible | ✅ Owned Only | ❌ Hidden | ❌ Hidden |
| **Author (Non-owner)** | ✅ Read | ❌ Hidden | ✅ Visible | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| **Editor** | ✅ Read | ✅ Any Post | ✅ Visible | ✅ Moderate / Own | ✅ Visible | ❌ Hidden |
| **Administrator Only** | ✅ Read | ❌ Hidden | ❌ Hidden | ❌ Hidden | ❌ Hidden | ✅ Visible |
| **Author + Editor** | ✅ Read | ✅ Any Post | ✅ Visible | ✅ Moderate / Own | ✅ Visible | ❌ Hidden |
| **Author + Admin** | ✅ Read | ✅ Owned Post | ✅ Visible | ✅ Owned Only | ❌ Hidden | ✅ Visible |
| **Editor + Admin** | ✅ Read | ✅ Any Post | ✅ Visible | ✅ Moderate / Own | ✅ Visible | ✅ Visible |

---

## Verification Results

### Automated Tests
- **Total Test Files**: 47
- **Total Tests**: 354
- **Passed**: 354
- **Failed**: 0
- **Skipped**: 0

### Static Code Quality
- **ESLint**: 0 errors, 0 warnings
- **Production Build**: Successfully compiled (`vite build`)

---

## Final Completion Status
Fully complete and verified.
