# Blog Platform Frontend

The React single-page application for the Production-Grade Blog Platform. Frontend Feature 01 established the browser foundation, and Frontend Feature 02 adds the implemented authentication and session architecture.

## Technology Stack

* React 19
* Vite 8
* React Router 8 Data Mode
* Tailwind CSS 4 with the first-party Vite plugin
* Axios 1
* ESLint 10
* Vitest 4
* React Testing Library
* jsdom
* JavaScript and npm

## Current Architecture

```text
index.html → src/main.jsx → App.jsx → AuthProvider → RouterProvider
                                                     ↓
                                              routes/router.jsx
                                                     ↓
                                      guards → RootLayout → Outlet → page

.env.local → Vite validation → environment.js → apiClient.js
                                                   ↓
                               bearer attachment and refresh coordination

localStorage refresh → session restoration → rotated tokens → /auth/me/
```

Folder responsibilities:

```text
src/config/   Validated public runtime configuration
src/features/ Feature-owned behavior; authentication is under features/auth/
src/layouts/  Shared route shells
src/lib/      Shared infrastructure such as Axios
src/pages/    Route-level screens
src/routes/   Central route composition
src/test/     Shared frontend test setup
```

Feature-oriented folders are added only when they own implemented behavior. Authentication separates API calls, components, Context state, invalidation events, hooks, pages, storage, and utilities without moving form input state or general server state into Context.

```text
src/features/auth/
├── api/          Login, current-user, logout, and dedicated refresh transport
├── components/   Route guards, loading UI, and account navigation
├── context/      Auth state machine and Strict Mode-safe restoration
├── events/       Framework-independent session invalidation bridge
├── hooks/        Focused Context consumer
├── pages/        Login and controlled unauthorized screens
├── storage/      Memory access token and localStorage refresh token
└── utils/        Error, form, and safe-return-path normalization
```

## Prerequisites

Install Node.js and npm. This documentation pass verified Node `v24.18.0` and npm `11.16.0`; dependency engine constraints in `package-lock.json` remain authoritative.

## Installation

From `frontend/`:

```bash
npm install
```

The committed `package-lock.json` provides repeatable dependency resolution. Do not commit `node_modules/`.

## Environment Setup

Copy the example into a local environment file:

```powershell
Copy-Item .env.example .env.local
```

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

`.env.local` is ignored. The URL must be absolute, use HTTP or HTTPS, and contain no embedded credentials. Trailing slashes are removed at runtime. `VITE_` values are embedded in browser code and must never contain secrets.

For local full-stack development, use the frontend origin `http://localhost:5173`. Django development CORS allows that origin only for `/api/`, keeps credentials disabled, and does not use a wildcard. Production inherits an empty CORS origin allowlist unless explicitly configured.

## Development Server

```bash
npm run dev
```

Vite validates `VITE_API_BASE_URL` before startup.

## Linting

```bash
npm run lint
```

ESLint applies browser globals to source modules and Node globals to configuration modules.

## Automated Tests

```bash
npm run test
npm run test:watch
```

Vitest runs in jsdom with React Testing Library and isolated Axios mocks. The completed Frontend Feature 02 suite contains 12 test files and 135 passing tests. It covers token storage, authentication APIs and errors, AuthProvider restoration, session invalidation, Axios bearer and refresh coordination, guards, safe return paths, login, logout, and authentication navigation.

The real frontend and Django stack also passed a 35-of-35 authentication verification matrix. This evidence is separate from the deterministic automated suite.

## Production Build

```bash
npm run build
```

The optimized output is written to ignored `dist/`.

## Production Preview

```bash
npm run preview
```

Preview serves the built output for local verification; it is not the production deployment architecture.

## Routing Architecture

Frontend Feature 01 introduced one Data Mode browser router at module scope, the root layout, Home and Not Found pages, and the root error boundary. Frontend Feature 02 preserves that composition and adds focused authentication guards.

`ProtectedRoute` renders a controlled checking screen, redirects anonymous users to `/login` while preserving only the attempted pathname, query, and fragment, and renders its outlet after authentication. `AnonymousOnlyRoute` keeps authenticated users away from `/login`. `RoleProtectedRoute` supports explicit any-role matching and fails closed for malformed configuration. The safe-return utility accepts only internal paths beginning with one `/` and rejects absolute, protocol-relative, backslash-containing, and malformed values.

| Path | Page |
| --- | --- |
| `/` | Home |
| `/login` | Anonymous-only login page |
| `/unauthorized` | Protected controlled 403 page |
| `*` | Not Found |

Hosts will eventually need SPA history fallback so direct browser requests reach `index.html`.

## API Client Architecture

`src/config/environment.js` validates and normalizes the public API URL. `src/lib/apiClient.js` creates one Axios instance with the configured base URL, a 10-second timeout, and `Accept: application/json`.

There is intentionally no global `Content-Type`; Axios remains responsible for JSON headers and multipart boundaries. The authentication interceptors are installed once when the shared module is evaluated. The request interceptor reads the current in-memory access token at request time and attaches it only to the configured API origin and path. It preserves an explicitly supplied Authorization header.

An eligible protected `401` joins one module-level refresh promise. Successful rotation replaces both tokens, updates the retry bearer header, and retries the original request once. Login, logout, refresh, and verify endpoints; explicitly authorized requests; skipped requests; untrusted destinations; and requests already retried are excluded. Refresh uses a dedicated Axios client to avoid a circular dependency and recursive interception. A framework-independent invalidation event tells AuthProvider when refresh failure makes the current session unusable.

## Authentication and Token Lifecycle

AuthProvider owns this state contract:

```text
checking        Initial restoration is unresolved
authenticated   Authoritative /auth/me/ user is loaded
unauthenticated No current user is trusted
```

The Context exposes `user`, `status`, `isAuthenticated`, `authError`, `login`, `logout`, `clearAuthError`, `hasRole`, and `hasAnyRole`. It never exposes tokens. Form values remain local to the login page.

Token storage is deliberately split:

```text
Access token   Module memory only
Refresh token  localStorage: blog-platform.auth.refresh-token
User data      React state only; never persisted by token storage
```

The implemented endpoint flows are:

```text
Login
POST /auth/login/ { email, password }
  -> store access and refresh
  -> GET /auth/me/
  -> authenticate with the /me/ user and roles

Reload
read persisted refresh
  -> POST /auth/token/refresh/ { refresh }
  -> atomically replace returned access and rotated refresh
  -> GET /auth/me/

Logout
POST /auth/logout/ { refresh } with Authorization: Bearer <access>
  -> clear browser authentication state on success or failure
```

Strict Mode restoration consumers share one in-flight initialization promise, which is cleared after settlement. Temporary network, timeout, and server failures clear the unusable access token but preserve the refresh token for a later attempt. Definitive rejection clears both tokens. Logout immediately makes local state unauthenticated and surfaces safe revocation uncertainty if the backend request fails.

`/auth/me/` is the single source of truth for `Author`, `Editor`, and `Administrator` role names. Roles are independent: Administrator does not imply Editor, and Editor does not imply Author. Navigation badges and route guards improve the user experience only; Django permissions remain authoritative.

The login page uses email and password only, performs client-side required and email-format checks, prevents duplicate submission, renders normalized accessible errors, and validates any attempted internal return path before replacement navigation. Authentication navigation avoids checking-state flashes, shows safe current-user data, and never renders email addresses or tokens.

## Security Notes

The Django backend remains authoritative for authentication, authorization, validation, and visibility. Client-side route and link visibility cannot enforce permissions. JWT roles are not decoded or trusted for authorization. Errors are normalized before UI rendering, safe-return validation prevents external post-login redirects, and tokens and passwords are not logged or rendered. No authentication cookies, session authentication, or credentialed cross-origin requests are used.

## Current Limitations

* A refresh token in localStorage remains exposed if malicious script executes in the application origin; an HttpOnly-cookie design would reduce that exposure but requires a different backend contract.
* Refresh coordination is single-flight within one browser tab only. Tabs do not coordinate rotation, so simultaneous cross-tab refresh can invalidate one tab's token.
* If the backend rotates a refresh token but its response is lost, the client cannot know whether the stored old token is still usable or already blacklisted.
* Logout is locally authoritative, but server revocation cannot be guaranteed when the backend is unavailable or a usable access token is absent. The access token remains valid until expiry if the backend did not receive the logout request.
* Role helpers, role guards, and role badges exist, but no business-domain role-protected frontend route or role-specific business link is mounted yet.
* Browser-history deployment still requires an SPA fallback to `index.html`.

## Next Frontend Milestone

Frontend Feature 02 — Authentication & Session Architecture is complete. The next frontend milestone is pending roadmap selection.
