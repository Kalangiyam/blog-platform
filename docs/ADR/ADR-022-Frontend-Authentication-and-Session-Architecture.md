# ADR-022 — Frontend Authentication and Session Architecture

## Status

* **Status:** Accepted
* **Feature:** Frontend Feature 02 — Authentication & Session Architecture

## Date

2026-08-06

---

# Context

The React application is a separate Vite single-page application that consumes the Django REST Framework API. The backend returns Simple JWT access and refresh tokens in JSON, authenticates protected requests through `Authorization: Bearer <access_token>`, rotates refresh tokens, and blacklists replaced or explicitly logged-out refresh tokens. It does not issue authentication cookies.

Frontend Feature 01 established the build, route, styling, configuration, and shared Axios boundaries but intentionally deferred browser authentication. Frontend Feature 02 must add session restoration, login and logout orchestration, authenticated request handling, protected routing, role-aware user experience, controlled errors, and regression tests without moving authentication or authorization authority into React.

The design must account for several security and correctness constraints:

* A persisted access token unnecessarily increases the lifetime of access-token exposure to injected JavaScript.
* A refresh response contains both a new access token and a replacement refresh token because rotation and blacklisting are enabled.
* React Strict Mode can run startup effects more than once during development.
* Multiple protected requests can receive `401` responses concurrently.
* Application roles are independent Django Group memberships and can change independently of token lifetime.
* Client-side route and navigation controls cannot enforce backend permission rules.
* The frontend and backend use different development origins.

---

# Decision

## Token Storage Strategy

The access token is held only in module memory by `tokenStorage.js`. It is never written to `localStorage`, `sessionStorage`, Context, user state, URLs, logs, or environment configuration.

The refresh token is persisted under one namespaced `localStorage` key:

```text
blog-platform.auth.refresh-token
```

All direct browser-storage access is confined to the token-storage module. Reads, writes, and removals handle missing, unavailable, or restricted storage without leaking raw browser exceptions. A token-pair update validates both values, writes the replacement refresh token first, and exposes the matching access token in memory only after persistence succeeds. Failed persistence clears access memory and fails closed.

No user data is persisted with the tokens. JWTs are not decoded for identity, role, or authorization decisions.

## Session Restoration

`AuthProvider` owns the three-state authentication model:

```text
checking
authenticated
unauthenticated
```

On startup, the provider reads the refresh token through the storage abstraction. When no refresh token exists, it performs no authentication request and settles unauthenticated. When a refresh token exists, it calls the refresh endpoint and then calls `/auth/me/`. Only successful completion of both operations produces the authenticated state.

Temporary network, timeout, or server failures clear access memory and leave the user unauthenticated while preserving the refresh token for a later attempt. Definitive token rejection clears both tokens. Every path leaves `checking`; an operational failure is represented by a safe `authError`, not a fourth authentication status.

The provider uses mounted-state guards to avoid state updates after unmount. Login and logout wait for an active startup restoration before beginning so rotation cannot repopulate credentials after a competing local action.

## Current-User Authority

`GET /api/auth/me/` is the exclusive frontend authority for the authenticated user and application roles. The limited user object nested in the login response is not treated as the completed session identity.

The `/me/` response supplies:

```text
id
username
email
first_name
last_name
roles
```

Roles come from application-managed Django Groups and remain independent. `Administrator` does not imply `Editor`; `Editor` does not imply `Author`. Context helpers perform exact role-name matching for presentation and navigation only. Role claims are not added to or read from JWTs.

## Refresh Rotation

The backend issues access tokens with a 15-minute lifetime and refresh tokens with a seven-day lifetime. Every successful refresh returns both a new access token and a replacement refresh token. The submitted refresh token is blacklisted.

The frontend therefore replaces the complete token pair after every successful login or refresh. It never retains the old refresh token as a fallback because that token is no longer valid after successful rotation.

A narrowly scoped refresh transport avoids a circular dependency between `apiClient.js` and `authApi.js` and prevents the refresh request from recursively entering the authenticated response-retry path.

## Single-Flight Refresh

Two small single-flight guards serve different boundaries:

* Startup restoration shares one module-level in-flight promise so React Strict Mode consumers do not submit the same rotating refresh token twice.
* Axios response handling shares one in-flight refresh promise across concurrent protected-request `401` responses.

Each guard exists only while its operation is pending and is cleared in `finally`. Settled results are not permanently cached, so later legitimate restoration or refresh operations can run. Waiting requests receive the newly stored access token and retry independently after the shared refresh succeeds.

## Interceptor Exclusions

The shared Axios request interceptor reads the current access token at request time and attaches it only to requests within the configured API origin and path. It does not overwrite a caller-supplied `Authorization` header and does not set a global `Content-Type`, preserving Axios multipart boundary behavior.

Automatic refresh is limited to eligible `401` responses. It excludes:

```text
/auth/login/
/auth/logout/
/auth/token/refresh/
/auth/token/verify/
```

It also excludes requests that:

* already retried once;
* explicitly opt out of refresh;
* supplied an explicit authorization header;
* have no persisted refresh token;
* fall outside the trusted API origin or path.

An eligible original request retries at most once with the replacement access token. A second `401` clears the invalid session rather than starting another loop.

## Session Invalidation Bridge

Axios infrastructure does not import React or manipulate UI state. A framework-independent subscription bridge publishes one normalized session-invalidated event when a shared refresh fails or a retried request is rejected. `AuthProvider` subscribes on mount, unsubscribes on cleanup, and transitions to unauthenticated with the safe error.

This preserves the boundary between HTTP coordination and React state while ensuring the UI cannot remain authenticated after access credentials become unusable.

## Protected Routes

Route guards consume Context state and never call authentication APIs themselves.

* `checking` renders a controlled accessible loading screen and no protected content.
* `unauthenticated` redirects to `/login` and preserves only the internal `pathname`, `search`, and `hash` in navigation state.
* `authenticated` renders the protected outlet.
* The anonymous-only guard renders login only for unauthenticated users and safely returns authenticated users to a validated internal path or `/`.
* The role guard uses any-role matching, fails closed for malformed configuration, and renders the controlled Unauthorized page when roles are insufficient.

Return paths must begin with one `/`, remain on the internal application origin, and reject absolute, protocol-relative, backslash-bearing, malformed, or non-string values.

## Role-Aware UX

The shared navigation displays the authenticated user, application-role badges, and logout control only from Context state. Role helpers return `false` for missing or malformed role data and never infer hierarchy.

These checks improve navigation and route experience only. Django REST Framework permission classes, queryset scoping, and object-level checks remain the authority for every protected operation.

## Login and Logout

Login submits only email and password, allows the API layer to store the returned token pair, then obtains the authoritative user through `/me/`. The form maps safe normalized errors, prevents duplicate submission, manages focus for invalid fields, clears the password after credential rejection, and follows only a validated internal return path.

Logout attempts backend refresh-token blacklisting but always clears Context state and local tokens. Local logout is authoritative for the browser even when the backend is unavailable. Backend revocation failure remains observable through a normalized rejection and a controlled navigation warning. Concurrent logout consumers share one in-flight operation.

## Error Handling

Authentication-specific normalization maps expected failures to a small safe contract:

```text
invalid_credentials
validation_error
network_error
request_timeout
unauthorized
server_error
storage_unavailable
unexpected_error
```

Normalized errors expose only a controlled message, code, optional HTTP status, and allowlisted field messages. They do not expose raw Axios request or response objects, stack traces, tokens, passwords, backend diagnostic details, or navigation behavior.

## CORS Dependency

The backend uses `django-cors-headers==4.9.0`. Its middleware runs before Django CommonMiddleware. CORS is limited to `/api/` paths, credentials are disabled, and the base/production allowlist is empty.

Development settings allow exactly:

```text
http://localhost:5173
```

No wildcard origin, cookie credential support, or CSRF trust expansion is introduced. The fixed development origin is non-secret configuration and does not require a new environment variable.

---

# Alternatives Considered

## Both Tokens in localStorage

Rejected because it would persist the short-lived access token and increase its exposure window during an XSS compromise. It also makes accidental use of a stale access token after reload more likely.

## Both Tokens in sessionStorage

Rejected because it still persists the access token to browser storage and cannot restore the session after the browser tab is closed. It does not provide the accepted refresh-based reload behavior.

## In-Memory Access Plus localStorage Refresh

Selected because it matches the current JSON-token backend, limits access-token persistence, supports session restoration, and requires no backend authentication redesign.

## HttpOnly Refresh-Token Cookie

Not selected for the current feature because the backend does not issue authentication cookies and the accepted contract returns tokens in JSON. This option would require coordinated cookie, credentialed CORS, CSRF, rotation, and logout changes.

An `HttpOnly`, `Secure`, appropriately scoped refresh cookie is stronger against direct refresh-token theft by injected JavaScript and remains the preferred future hardening direction when the backend contract can change.

## JWT Role Claims

Rejected because role membership can change before a token expires and the backend already exposes current application-managed roles through `/me/`. Claims would duplicate authority, risk stale navigation, and encourage the frontend to treat token contents as permission evidence.

---

# Consequences

## Advantages

* Access tokens disappear on reload and are not persistently exposed.
* Refresh rotation is applied correctly and atomically at the frontend boundary.
* `/me/` provides one current source of truth for user identity and roles.
* Strict Mode and concurrent `401` responses do not cause uncontrolled duplicate in-tab refreshes.
* HTTP infrastructure remains independent of React.
* Protected content does not flash while authentication is unresolved.
* Errors and redirects are constrained before reaching the UI.
* Multipart request behavior and explicit authorization headers remain intact.
* Development cross-origin access is narrow and production remains deny-by-default.

## Disadvantages

* Every browser reload requires a refresh request followed by `/me/`.
* The refresh token remains readable to JavaScript because the current backend does not support an HttpOnly-cookie contract.
* The state machine, refresh coordination, invalidation bridge, and guards add more client complexity than a cookie/session design.
* Local logout can complete even when server-side token revocation cannot be confirmed.
* Frontend role controls must be maintained without ever being mistaken for authorization enforcement.

## Risks

* XSS can read the persisted refresh token and act within its remaining lifetime.
* A regression in retry eligibility could cause refresh loops or send bearer credentials to an unintended target.
* Incorrect token-pair replacement could retain a blacklisted refresh token.
* Concurrency outside the current browser tab can bypass in-tab single-flight coordination.
* UI code could incorrectly treat role visibility as backend permission.

Mitigations include centralized storage, trusted-origin/path checks, one-retry flags, endpoint exclusions, controlled rendering, React escaping, safe return-path validation, backend authorization, and automated regression coverage.

## Known Limitations

* **Refresh-token XSS exposure:** `localStorage` remains readable to injected JavaScript.
* **Cross-tab refresh rotation:** tabs share the refresh token but not access-token memory or the in-tab refresh promise, so simultaneous rotations can race.
* **Lost refresh-response ambiguity:** the backend may rotate and blacklist the submitted token even if the browser never receives the replacement response.
* **Logout revocation limits:** an expired access token or unavailable backend can prevent server-side blacklisting even though local logout succeeds.
* **No mounted business or role route:** role-guard infrastructure exists and is tested, but no current Posts, Profiles, or Administration screen is mounted behind it.
* **Controlled invalid-token expiry verification:** expiry behavior was verified with invalid-token responses rather than waiting for the natural 15-minute access-token lifetime.
* **No end-to-end framework:** automated coverage uses Vitest, jsdom, React Testing Library, and Axios Mock Adapter; Playwright or Cypress is not installed.

The limitations are accepted for this milestone and must remain visible in future security and deployment reviews.
