# Frontend Feature 02 — Authentication & Session Architecture

## Feature Summary

**Feature Name:** Authentication & Session Architecture

**Business Purpose:** Provide a safe, maintainable browser authentication experience for readers and editorial users while preserving Django REST Framework as the authority for identity, roles, permissions, and protected data.

**Real-World Usage:** A user can sign in with email and password, restore a persisted session after reload, make bearer-authenticated API requests, recover from an expired access token, follow safe protected-route redirects, see current application roles, and sign out locally even when backend revocation fails.

**Implementation Summary:** The frontend stores access tokens in memory and refresh tokens in namespaced `localStorage`, restores sessions through refresh plus `/me/`, coordinates rotating refresh tokens with single-flight promises, attaches bearer tokens through a trusted-scope Axios interceptor, exposes authentication through Context, supplies login/logout and route-guard UX, and verifies the behavior with automated and real-stack browser checks.

**Documentation-Time Status:** Implementation and verification are complete. The final combined suite passed all 135 automated tests in 12 files after two safe-return-path regression tests. ESLint, the Vite production build, Django system checks, and migration-drift checks passed. Real-stack Microsoft Edge CDP verification passed 35 of 35 checks.

---

# Business Purpose

The backend already provides secure email authentication, JWT issuance, refresh rotation, refresh-token blacklisting, application roles, and protected APIs. The browser needs to consume those contracts without duplicating backend authority or persisting more token material than necessary.

This feature establishes the session foundation used by later Posts, Profiles, Comments, and Administration interfaces. It solves browser reload restoration, access-token expiry, concurrent `401` recovery, safe login return navigation, role-aware presentation, and reliable local logout once so future feature screens do not implement competing authentication behavior.

---

# Architecture Summary

```text
Browser startup
    ↓
AuthProvider: checking
    ↓
persisted refresh token?
    ├─ no  → unauthenticated
    └─ yes → refreshSession()
                 ↓ rotate access + refresh
             GET /auth/me/
                 ↓
             authenticated user + roles
```

```text
Protected API request
    ↓
request interceptor reads in-memory access token
    ↓
trusted API receives Bearer token
    ↓
401 response
    ↓
eligibility and one-retry checks
    ↓
shared in-tab refresh promise
    ├─ success → replace both tokens → retry once
    └─ failure → invalidate Context session → reject safely
```

```text
AuthProvider
    ├─ user, status, authError
    ├─ login / logout
    ├─ role helpers
    └─ session-invalidation subscription
             ↓
Router guards → Login / Unauthorized / protected outlets
             ↓
Root navigation → identity, role badges, logout
```

The frontend owns session coordination and user experience. Django REST Framework remains authoritative for authentication, role membership, queryset visibility, object ownership, and every permission decision.

No Redux or general server-state store was introduced. Authentication Context contains only the current authentication session, not arbitrary API data.

---

# Files Created

## Backend Prerequisite File

| File | Responsibility |
| --- | --- |
| `backend/apps/users/serializers/mixins.py` | Serializes only allowlisted application-managed Django Group names in deterministic order. |

## Frontend Runtime Files

| File | Responsibility |
| --- | --- |
| `frontend/src/features/auth/api/authApi.js` | Maps login, `/me/`, and logout contracts to useful data and token lifecycle behavior. |
| `frontend/src/features/auth/api/tokenRefresh.js` | Uses a narrowly scoped Axios client for rotation without recursive authenticated interception. |
| `frontend/src/features/auth/storage/tokenStorage.js` | Owns in-memory access and namespaced persistent refresh storage. |
| `frontend/src/features/auth/utils/authErrors.js` | Normalizes authentication failures into a safe, small error contract. |
| `frontend/src/features/auth/utils/loginForm.js` | Owns login-field validation and controlled form messages. |
| `frontend/src/features/auth/utils/safeReturnPath.js` | Validates internal post-login return paths and navigation-state shapes. |
| `frontend/src/features/auth/context/AuthContext.js` | Defines Context and the three authentication status values. |
| `frontend/src/features/auth/context/AuthProvider.jsx` | Owns the authentication reducer, public contract, login/logout orchestration, and invalidation subscription. |
| `frontend/src/features/auth/context/sessionRestoration.js` | Performs refresh-plus-`/me/` restoration behind a Strict Mode-safe in-flight promise. |
| `frontend/src/features/auth/hooks/useAuth.js` | Supplies guarded Context access to components. |
| `frontend/src/features/auth/events/sessionInvalidation.js` | Bridges Axios session failures to React without importing React into HTTP infrastructure. |
| `frontend/src/features/auth/components/AuthLoadingScreen.jsx` | Blocks protected content with accessible checking-state UI. |
| `frontend/src/features/auth/components/ProtectedRoute.jsx` | Redirects anonymous users and preserves a safe internal attempted location. |
| `frontend/src/features/auth/components/AnonymousOnlyRoute.jsx` | Restricts login to anonymous users and safely returns authenticated users. |
| `frontend/src/features/auth/components/RoleProtectedRoute.jsx` | Applies fail-closed any-role UX checks without claiming backend authorization. |
| `frontend/src/features/auth/components/AuthNavigation.jsx` | Presents login, identity, independent role badges, logout, and controlled revocation warnings. |
| `frontend/src/features/auth/pages/LoginPage.jsx` | Implements the accessible email/password login workflow. |
| `frontend/src/features/auth/pages/UnauthorizedPage.jsx` | Provides a controlled authenticated-but-forbidden experience. |

## Frontend Test Files

| File | Coverage |
| --- | --- |
| `frontend/.env.test` | Supplies the trusted API URL used by deterministic tests. |
| `frontend/src/test/setup.js` | Installs jest-dom matchers and test cleanup. |
| `frontend/src/features/auth/storage/tokenStorage.test.js` | Memory/persistence boundaries, atomicity, restricted storage, and secret handling. |
| `frontend/src/features/auth/utils/authErrors.test.js` | Authentication error categories and raw-detail exclusion. |
| `frontend/src/features/auth/utils/safeReturnPath.test.js` | Internal-path allowlisting and external/backslash rejection. |
| `frontend/src/features/auth/api/authApi.test.js` | Exact login, `/me/`, and logout contracts and cleanup. |
| `frontend/src/features/auth/api/tokenRefresh.test.js` | Rotation replacement and definitive/temporary failure behavior. |
| `frontend/src/features/auth/context/sessionRestoration.test.js` | Startup outcomes and Strict Mode single-flight behavior. |
| `frontend/src/features/auth/context/AuthProvider.test.jsx` | Context transitions, authoritative `/me/`, role helpers, login, logout, and invalidation. |
| `frontend/src/features/auth/events/sessionInvalidation.test.js` | Subscription, notification, and cleanup. |
| `frontend/src/features/auth/components/authRouteGuards.test.jsx` | Loading, redirects, roles, malformed configuration, and return paths. |
| `frontend/src/features/auth/pages/LoginPage.test.jsx` | Validation, accessibility, submission, errors, and safe navigation. |
| `frontend/src/lib/apiClient.test.js` | Header scope, retry eligibility, single-flight refresh, invalidation, and multipart safety. |
| `frontend/src/layouts/RootLayout.test.jsx` | Authentication-aware navigation and logout states. |

## Documentation Files

| File | Responsibility |
| --- | --- |
| `docs/ADR/ADR-022-Frontend-Authentication-and-Session-Architecture.md` | Records the accepted frontend authentication decisions and trade-offs. |
| `docs/feature/Frontend-Feature-02-Authentication-and-Session-Architecture.md` | Records implementation, verification, limitations, and handoff context. |

---

# Files Modified

## Backend Prerequisites

| File | Change |
| --- | --- |
| `backend/apps/users/serializers/authentication.py` | Adds filtered roles to `/me/` and updates `last_login` through Django's helper when Simple JWT enables it. |
| `backend/apps/users/serializers/administration.py` | Reuses the application-role serialization mixin. |
| `backend/config/settings/base.py` | Installs CORS middleware with an empty default allowlist, API-only scope, and credentials disabled. |
| `backend/config/settings/development.py` | Allows only the Vite development origin. |
| `backend/requirements/base.txt` | Adds `django-cors-headers==4.9.0`. |

## Frontend

| File | Change |
| --- | --- |
| `frontend/package.json` | Adds Vitest, jsdom, React Testing Library, jest-dom, user-event, Axios Mock Adapter, and test scripts. |
| `frontend/package-lock.json` | Locks the frontend testing dependency graph. |
| `frontend/vite.config.js` | Configures the jsdom test environment, stable browser URL, setup module, and mock cleanup. |
| `frontend/src/App.jsx` | Mounts `AuthProvider` above `RouterProvider`. |
| `frontend/src/lib/apiClient.js` | Adds trusted-scope bearer attachment, eligible `401` recovery, single-flight refresh, one retry, and invalidation. |
| `frontend/src/routes/router.jsx` | Adds anonymous-only login and protected Unauthorized routes while preserving centralized route composition. |
| `frontend/src/layouts/RootLayout.jsx` | Integrates authentication-aware navigation into the shared shell. |

## Documentation

| File | Change |
| --- | --- |
| `README.md` | Updates project capabilities, frontend tree, commands, exact current authentication contracts, testing evidence, limitations, and milestone. |
| `frontend/README.md` | Documents the provider, storage, API/interceptor, route, login/logout, navigation, testing, and security architecture. |
| `docs/Architecture.md` | Adds the Frontend Feature 02 architecture while preserving Feature 01 history. |
| `docs/API-Specification.md` | Corrects and expands exact login, `/me/`, logout, refresh, verify, role, and `last_login` contracts. |
| `docs/Authentication-Flow.md` | Replaces access-only/future frontend wording with the implemented rotating session lifecycle. |
| `docs/Testing-Strategy.md` | Records the installed frontend test stack, automated coverage, real-stack checks, and remaining backend test gap. |
| `docs/Project-Status.md` | Marks Frontend Feature 02 complete and updates modules, authentication, testing, ADR/report inventories, decisions, pending work, and milestone. |
| `docs/ADR/ADR-007-JWT-Authentication.md` | Narrowly clarifies stateless access verification versus database-backed refresh rotation and revocation. |
| `docs/feature/Feature-03-JWT-Authentication-Foundation.md` | Adds a historical note for removed registration and the evolved refresh contract. |

---

# Backend Prerequisites

Three narrowly scoped backend changes were completed before frontend authentication began:

1. `/api/auth/me/` now returns `roles`, sourced from Django Groups and filtered through `APPLICATION_GROUPS`. It does not expose staff, superuser, permissions, Group IDs, or unrelated Groups.
2. `django-cors-headers` allows only `http://localhost:5173` in development, leaves credentials disabled, and keeps production deny-by-default through the empty base allowlist.
3. Successful login calls Django's `update_last_login()` helper when `UPDATE_LAST_LOGIN` is enabled.

These prerequisites did not change login input/output, JWT claims, URLs, refresh rotation, blacklisting, permission architecture, or authentication type. No cookies or session authentication were introduced.

---

# Models and Database Changes

No model was created or changed by Frontend Feature 02. No business database schema changed and no business migration was added.

Simple JWT's existing outstanding-token and blacklist tables continue to store refresh lifecycle state. Updating `User.last_login` writes an existing model field; it does not add a column.

---

# Authentication State Model

Context uses exactly three states:

| Status | User | Meaning |
| --- | --- | --- |
| `checking` | `null` | Startup restoration has not settled; guarded content must not render. |
| `authenticated` | `/me/` response | A current access token and authoritative user are available. |
| `unauthenticated` | `null` | No usable authenticated browser session exists. |

Operational failures are stored separately as `authError`; there is no error authentication status.

The public Context contract is:

```text
user
status
isAuthenticated
authError
login(credentials)
logout()
clearAuthError()
hasRole(role)
hasAnyRole(roles)
```

Token values and storage functions are not exposed through Context.

---

# Token Storage

The access token lives only in a module variable. It is cleared on reload, explicit logout, definitive invalidation, failed refresh, and failed session establishment.

The refresh token is stored only under:

```text
blog-platform.auth.refresh-token
```

Token-pair replacement writes refresh persistence before publishing the matching access token. Missing or invalid pairs clear stale credentials. Browser-storage getters and operations are wrapped so restricted storage produces safe failure rather than a raw `DOMException`.

User data, role data, passwords, and access tokens are not persisted. The implementation does not decode JWTs.

---

# API Integration

The authentication API module uses the existing shared Axios boundary and returns useful data rather than raw Axios responses.

| Function | Backend request | Frontend result |
| --- | --- | --- |
| `login({ email, password })` | `POST /auth/login/` with exact email/password fields | Stores the token pair and returns the nested login user for orchestration. |
| `getCurrentUser()` | `GET /auth/me/` with the in-memory bearer token | Returns the authoritative user and roles. |
| `refreshSession()` | `POST /auth/token/refresh/` with the current refresh token | Replaces both tokens and returns the new access token. |
| `logout()` | `POST /auth/logout/` with refresh body and bearer header | Returns the safe detail value and clears local tokens even on failure. |

The frontend does not call `/auth/token/verify/`; refresh followed by `/me/` proves both session continuity and current identity.

No global JSON `Content-Type` is set, so future image uploads retain correct multipart boundaries.

---

# Session Restoration

At provider mount:

```text
checking
    ↓
read refresh token
    ├─ absent → unauthenticated, no request
    └─ present
         ↓
      rotate token pair
         ↓
      GET /me/
         ├─ success → authenticated with authoritative user
         └─ failure → clear access, classify error, unauthenticated
```

Definitive rejection clears the refresh token. Temporary network/server failure preserves it for a later attempt but does not leave the application authenticated without access credentials.

The startup promise exists at module scope, is shared while pending, and is cleared in `finally`. This protects rotating tokens from React Strict Mode's development effect replay without permanently caching a session result.

---

# Axios Interceptors

The request interceptor:

* reads access memory for each request;
* validates the effective request origin and API path;
* attaches `Authorization: Bearer` only inside that trusted scope;
* preserves explicitly supplied authorization;
* leaves `Content-Type` and request bodies untouched.

The response interceptor handles eligible `401` responses. It marks the original configuration before refresh, waits for the shared refresh promise, replaces the stale interceptor-managed header, and retries once. A second rejection invalidates the session.

Authentication endpoints, explicit authorization, explicit skip flags, missing refresh credentials, already-retried requests, and out-of-scope requests do not enter automatic refresh.

---

# Refresh Concurrency

Concurrent protected failures share one promise:

```text
Request A ─┐
Request B ─┼─ 401 → one refresh → replacement pair → A/B/C retry once
Request C ─┘
```

The promise is cleared after settlement so future expiry can start another refresh. Notification occurs inside the shared failure path, avoiding one invalidation event per waiting request.

Startup single-flight and interceptor single-flight solve separate in-tab races. They do not coordinate separate browser tabs.

---

# Login

The login page provides controlled email and password fields with browser autocomplete metadata, client validation, backend field-error mapping, duplicate-submit prevention, accessible alert semantics, and focus movement to the first invalid field.

Successful login follows this sequence:

1. Submit only trimmed email and the original password.
2. Store the backend token pair through the storage abstraction.
3. Call `/me/` for the authoritative user and roles.
4. Set Context to authenticated.
5. Clear the password.
6. Navigate with replacement to a validated internal return path or `/`.

Credential rejection clears the password and focuses it again. Raw Axios errors, backend internals, passwords, and tokens are not rendered.

During verification, `AnonymousOnlyRoute` was corrected to consume the validated navigation-state return path for an already authenticated session. Two regression tests cover the safe destination and unsafe fallback behavior.

---

# Logout

Context clears authenticated browser state even when the backend cannot confirm blacklisting. Concurrent callers share one logout promise.

The API request sends both required credentials:

```text
Authorization: Bearer <access_token>

{
  "refresh": "<current-refresh-token>"
}
```

Local state becomes unauthenticated immediately. Tokens are cleared in all outcomes. A backend, network, or storage failure remains observable as a safe rejection and controlled navigation warning, but it cannot leave the UI authenticated.

---

# Protected Routes

`ProtectedRoute` blocks its outlet during `checking`, redirects anonymous users to `/login`, and stores only the attempted internal pathname, query, and fragment. Authenticated users render the outlet.

`AnonymousOnlyRoute` blocks during `checking`, renders login while unauthenticated, and sends authenticated users to the validated attempted path or `/`.

`RoleProtectedRoute` supports any-role matching, treats roles as independent, rejects malformed or empty configuration, and renders the controlled Unauthorized page when necessary. It is infrastructure for future business routes; no Posts, Profiles, or Administration route is mounted behind it yet.

The `/unauthorized` page is itself under ordinary authentication protection. Route guards contain no API calls and do not duplicate session restoration.

---

# Role-Aware Navigation

Navigation uses the `/me/` user held by Context. It displays a safe first name or username, exact application-role badges, and logout for authenticated users; anonymous users receive a login link; checking users receive a non-sensitive loading placeholder.

Only these application roles are presented:

```text
Author
Editor
Administrator
```

No inheritance is inferred. Hidden links and route guards are user-experience controls; they cannot grant access to backend resources.

---

# Error Handling

Authentication failures are normalized into safe codes for invalid credentials, field validation, network failure, timeout, unauthorized/expired tokens, server failure, unavailable storage, and unexpected failure.

Field errors copy only allowlisted authentication fields. UI utilities map them again to controlled frontend text. Normalized errors omit raw Axios objects, token-bearing request configuration, backend diagnostic detail, and serialized stack traces.

The invalidation bridge allows HTTP infrastructure to notify Context without importing React. A faulty listener cannot prevent remaining subscribers from receiving the event.

---

# Security Review

Verified design properties include:

* Access tokens are never persisted.
* Refresh storage is centralized under one namespaced key.
* User and role data are not persisted.
* JWTs are not decoded for authorization.
* Passwords and tokens are not logged or rendered.
* Bearer tokens are attached only within the trusted configured API scope.
* Caller-supplied authorization is not overwritten.
* Multipart request handling remains intact.
* Refresh retries are endpoint-limited and occur at most once.
* Concurrent `401` responses share one in-tab refresh.
* Safe-return validation rejects external, protocol-relative, backslash-bearing, and malformed destinations.
* Checking state blocks protected-content flashes.
* Role checks do not infer hierarchy.
* Backend permissions remain authoritative.
* Development CORS allows only `http://localhost:5173`, credentials remain disabled, and production has no allowed origin by default.

The accepted refresh-token storage remains vulnerable to XSS. React escaping, avoidance of unsafe HTML, dependency review, and a future Content Security Policy remain important; an HttpOnly-cookie refresh architecture would require a coordinated backend change.

---

# Testing Coverage

The frontend test stack is:

```text
Vitest 4
jsdom
React Testing Library
jest-dom
user-event
Axios Mock Adapter
```

Automated coverage includes:

* token memory/persistence boundaries and restricted storage;
* secret non-exposure;
* authentication error normalization;
* exact login, `/me/`, refresh, and logout contracts;
* rotation replacement and blacklisting failures;
* startup restoration and Strict Mode single-flight behavior;
* provider state transitions and role helpers;
* request-header scope and multipart preservation;
* one-retry and concurrent-refresh behavior;
* session invalidation subscriptions;
* protected, anonymous-only, and role guard behavior;
* safe return paths, including the AnonymousOnlyRoute regression;
* login validation, accessibility, loading, errors, and navigation;
* role-aware navigation and local logout UX.

Final automated result after the two regression tests: **12 test files passed, 135 tests passed**. The focused guard/login slice passed 31 tests, the full `npm run test` run passed, ESLint passed, and the Vite production build completed with 156 transformed modules.

No test uses a real token service over the network. Axios adapters and module mocks keep automated tests deterministic.

---

# Manual Verification

Real-stack verification used Microsoft Edge controlled through the Chrome DevTools Protocol against the actual Vite frontend and Django/PostgreSQL backend.

Result: **35 of 35 checks passed.**

The checks covered startup without a session, successful restoration, invalid and blacklisted refresh tokens, temporary failure handling, login and `/me/`, validation and credential errors, rotated refresh replacement, protected API recovery, concurrent `401` behavior, logout success and failure, repeated logout, loading and route guards, safe return navigation, independent roles, navigation states, CORS behavior, local storage contents, and absence of token/password output.

Access expiry was exercised through controlled invalid-token responses rather than waiting for the natural 15-minute lifetime.

---

# Known Limitations

* The refresh token is readable to JavaScript in `localStorage` and is therefore exposed during a successful XSS attack.
* Refresh coordination is single-flight only within one tab. Separate tabs can race rotating the shared refresh token.
* A lost refresh response is ambiguous: the backend may have blacklisted the submitted token before the client receives its replacement.
* Logout may clear the browser session without revoking the server token when the access token is expired or the backend is unavailable.
* `RoleProtectedRoute` is implemented and tested, but no business or role-protected application screen is mounted yet.
* Access-token expiry was tested through controlled invalid-token behavior rather than a 15-minute natural wait.
* No Playwright, Cypress, or other end-to-end framework is installed.
* The current JSON-token backend does not provide the stronger HttpOnly refresh-cookie architecture.

---

# Key Learning Concepts

* **Split token storage:** Reduce persistent exposure by keeping access in memory while retaining reload restoration through refresh persistence.
* **Rotation-aware replacement:** Treat access and refresh as one versioned pair after every refresh.
* **Authoritative current user:** Fetch identity and roles from `/me/` rather than trusting a login subset or JWT claims.
* **Authentication state machine:** Represent unresolved, authenticated, and unauthenticated states explicitly.
* **Single-flight concurrency:** Share one promise instead of creating a separate refresh request and queue for every failed request.
* **Invalidation bridge:** Connect framework-independent HTTP behavior to React without reversing dependency direction.
* **Fail-closed route guards:** Block content while checking and reject malformed role configuration.
* **Open-redirect prevention:** Validate navigation state before post-login routing.
* **Local versus remote logout:** Clear browser authority even when server revocation remains uncertain.
* **Frontend authorization boundary:** Navigation and guards improve UX; backend permission code protects data.

---

# Interview Questions

## Why is the access token kept only in memory?

It shortens persistent exposure and guarantees reload restoration uses a fresh access token rather than a stale stored one.

## Why persist the refresh token at all?

The current backend returns tokens in JSON and does not offer an HttpOnly refresh cookie. Persistence is required to restore a session after reload under that contract.

## Why call `/me/` after login and refresh?

The login user is intentionally limited and JWTs contain no role claims. `/me/` supplies the current identity and application-managed roles.

## Why are two single-flight guards needed?

One protects startup restoration from Strict Mode effect replay; the other coordinates concurrent runtime `401` responses. Both cache only pending work.

## Why use a dedicated refresh transport?

It prevents recursive response interception and avoids a circular dependency between the shared client and authentication API modules.

## Why exclude login and logout from automatic refresh?

Refreshing those responses can obscure real credential/logout failures and can create retry loops, especially when logout already supplies explicit authorization.

## Why is Context not an authorization system?

Browser state can be altered by the user. Only backend authentication, permissions, queryset scoping, and object checks can protect an operation.

## Why clear local state when backend logout fails?

The frontend must not continue presenting an authenticated session merely because remote revocation could not be confirmed.

## Why reject protocol-relative and backslash-bearing return paths?

Browsers can interpret those forms as external authorities. Canonical internal-path validation prevents open redirects.

## What is the principal remaining security trade-off?

The persisted refresh token is accessible to injected JavaScript. An HttpOnly-cookie design would reduce that exposure but requires backend and CSRF/CORS changes.

---

# Common Mistakes

* Persisting the access token in `localStorage` or `sessionStorage`
* Writing token or user data outside the storage abstraction
* Decoding JWT role claims and treating them as current authorization
* Using the nested login user instead of `/me/`
* Retaining the old refresh token after rotation
* Starting one refresh for every concurrent `401`
* Retrying a request more than once
* Refreshing login, logout, refresh, or verify failures
* Overwriting explicit authorization headers
* Adding a global JSON `Content-Type` and breaking multipart boundaries
* Registering interceptors in a React render or Strict Mode effect
* Importing React into Axios infrastructure
* Rendering protected content while status is `checking`
* Treating Administrator as an implied Editor or Author
* Redirecting to an unvalidated URL after login
* Leaving Context authenticated after refresh or logout failure
* Claiming local logout always guarantees backend token revocation

---

# Refactoring Opportunities

Future requirements may justify:

* migrating refresh storage to an HttpOnly, Secure cookie through a coordinated backend contract;
* cross-tab rotation coordination using a carefully designed browser lock or messaging protocol;
* a dedicated end-to-end suite with Playwright or Cypress;
* mounting real Posts, Profiles, and Administration routes behind the existing guards;
* applying a production Content Security Policy and automated security-header checks;
* adding server-state tooling after real domain screens demonstrate caching and invalidation needs;
* extracting shared form controls only after another form proves the abstraction useful;
* introducing explicit session-generation coordination if future concurrent login/logout/refresh workflows require it.

These are requirement-driven opportunities, not reasons to expand the current feature before business screens exist.

---

# Definition of Done

## Completed

* [x] Backend `/me/`, CORS, and `last_login` prerequisites implemented.
* [x] Access memory and refresh persistence boundaries implemented.
* [x] Login, `/me/`, refresh, and logout API functions implemented.
* [x] Safe authentication error normalization implemented.
* [x] Context state machine and session restoration implemented.
* [x] Strict Mode and runtime refresh single-flight guards implemented.
* [x] Bearer attachment, retry-once, exclusions, and invalidation implemented.
* [x] Login, logout, guards, Unauthorized page, safe returns, and role navigation implemented.
* [x] Automated regression suite created.
* [x] Real-stack Edge CDP verification passed 35/35.
* [x] AnonymousOnlyRoute safe-return defect corrected with two regression tests.
* [x] ADR-022 and Feature Completion Report created.

## Verification Gates Completed

* [x] Final repository-wide run recorded: 12 files and 135 tests passed.
* [x] Final ESLint and Vite production-build runs passed.

---

# Final Outcome

Frontend Feature 02 establishes a complete browser authentication and session foundation around the existing Django REST Framework contracts. It limits persistent token exposure, handles rotating refresh tokens under concurrency, restores identity and roles from the authoritative endpoint, prevents protected-content flashes and unsafe redirects, and keeps backend permissions authoritative.

The implementation and verification are complete and ready for later business routes without embedding authentication logic into those screens. The next frontend feature remains a roadmap decision rather than an assumption in this report.
