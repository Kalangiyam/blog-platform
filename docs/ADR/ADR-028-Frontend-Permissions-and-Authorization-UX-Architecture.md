# ADR-028: Frontend Permissions and Authorization UX Architecture

## Status
Accepted

## Date
2026-08-06

## Context
The Production-Grade Blog Platform uses Django REST Framework (DRF) as its backend authority with Role-Based Access Control (RBAC) and object-level permissions (`IsPostAuthor`, `IsCommentAuthor`, `IsAuthor`, `IsEditor`, `IsAdministrator`).

To provide a predictable, accessible, and user-friendly experience, the React frontend requires a centralized authorization UX module. The module must predict action availability, prevent invalid navigation, show role-aware navigation links, and handle HTTP 403 Forbidden responses gracefully without compromising security boundaries or duplicating business logic.

## Decision
We implement a dedicated, pure, non-intrusive frontend authorization module in `frontend/src/features/permissions/` adhering to the following key design choices:

1. **Backend-Authoritative Security Boundary**:
   - Frontend authorization checks are strictly for UX prediction (hiding unavailable controls, showing clear explanations, avoiding dead clicks).
   - DRF backend permissions remain the sole enforcement authority. Every API request is independently authenticated and authorized by the server.

2. **Centralized Pure Authorization Rules & Utilities**:
   - `utils/roles.js`: Pure helpers (`hasRole`, `hasAnyRole`, `hasAllRoles`, `isAuthor`, `isEditor`, `isAdministrator`) operating on `/api/auth/me/` user data.
   - `utils/ownership.js`: Pure helpers (`isResourceOwner`, `isPostOwner`, `isCommentOwner`, `isProfileOwner`) performing safe numeric and username comparison.
   - `utils/authorizationRules.js`: Pure domain permission functions (`canEditPost`, `canDeletePost`, `canPublishPost`, `canManageFeaturedImage`, `canModerateComment`, `canManageUsers`).

3. **React Hooks & Declarative Integration**:
   - `useAuthorization`: Unifies AuthContext with role checks, ownership evaluation, and domain rules.
   - `useOwnership`: Binds ownership checking to the active user.
   - `Can`: Declarative component rendering children or fallback based on permission conditions.
   - `ForbiddenState` & `AuthorizationMessage`: Accessible 403 / warning callouts.

4. **Independent Role Semantics**:
   - Roles (`Author`, `Editor`, `Administrator`) remain independent.
   - Multi-role users receive the union of allowed capabilities.
   - Administrator-only users do not gain content editing or publishing privileges unless explicitly assigned `Author` or `Editor` roles.

5. **No Auto-Logout on 403**:
   - HTTP 403 Forbidden responses present controlled forbidden states or inline messages without terminating the active authenticated session.

## Consequences
### Positive
- Eliminates duplicated inline role checks (`user.roles.includes('Editor')`) across presentation components.
- Guarantees zero authorization control flash during startup session restoration (`status === CHECKING`).
- Ensures full keyboard accessibility and screen-reader polite announcements.
- Keeps frontend light and fast without third-party authorization libraries (CASL, Redux, Casbin).

### Negative / Risks
- Frontend rules could theoretically drift if backend DRF permissions change without updating `authorizationRules.js`. (Mitigated by automated regression integration tests).

## Alternatives Considered
- **Third-party CASL / Casbin library**: Rejected as unnecessary overhead for current DRF permission contracts.
- **JWT Claim Roles**: Rejected because `/api/auth/me/` serves as the authoritative source of truth.
- **Route-only authorization**: Rejected because UI components require granular element-level action visibility.
