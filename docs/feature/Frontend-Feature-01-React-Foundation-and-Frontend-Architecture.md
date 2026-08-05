# Frontend Feature 01 — React Foundation & Frontend Architecture

## Feature Summary

**Feature Name:** React Foundation & Frontend Architecture

**Business Purpose:** Establish a maintainable browser application foundation that can grow into the user-facing blog and editorial interface while preserving the backend as the security and business-rule authority.

**Real-World Usage:** Developers can install, configure, lint, build, preview, and navigate the SPA. Users can reach a responsive Home page, shared shell, controlled Not Found page, and safe route-error screen.

**Implementation Summary:** React 19 and Vite 8 bootstrap the application; React Router 8 composes nested routes; Tailwind CSS 4 supplies utility styling; validated environment configuration feeds one Axios client. Authentication and real API requests are not implemented.

**Completion Status:** ✅ Complete on 2026-08-05.

---

# Architecture Summary

## Application Startup, Routing, and Rendering

```text
index.html #root
    ↓
main.jsx → import CSS and API-client configuration → StrictMode → App
    ↓
RouterProvider → centralized createBrowserRouter route objects
    ↓
RootLayout → Outlet → / HomePage or * NotFoundPage
                    ↘ RouteErrorPage if route rendering fails
```

The router is created at module scope, not inside a rendering component. `RootLayout` owns the persistent header, main outlet, and footer. Page modules own route-level content.

## Environment and Axios Flow

```text
VITE_API_BASE_URL
    ↓
vite.config.js: required, absolute HTTP(S), no credentials
    ↓ build output
environment.js: repeat validation and trim trailing slashes
    ↓
apiClient.js: baseURL + 10,000 ms timeout + Accept header
    ↓
future Django REST API requests
```

Feature 01 establishes the frontend-to-backend communication boundary but sends no API requests. Route errors are converted into controlled user-facing output; raw internal errors are not rendered.

---

# Technology Decisions

Versions below are the declared versions in `frontend/package.json`.

## Runtime Dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `axios` | `^1.19.0` | Shared HTTP client |
| `react` | `^19.2.8` | UI runtime |
| `react-dom` | `^19.2.8` | Browser rendering |
| `react-router` | `^8.3.0` | Data Mode routing and navigation |

## Development Dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `@eslint/js` | `^10.0.1` | Base JavaScript lint rules |
| `@tailwindcss/vite` | `^4.3.3` | Tailwind Vite integration |
| `@types/react` | `^19.2.17` | React editor/type metadata |
| `@types/react-dom` | `^19.2.3` | React DOM editor/type metadata |
| `@vitejs/plugin-react` | `^6.0.4` | React transform and refresh support |
| `eslint` | `^10.8.0` | Static analysis |
| `eslint-plugin-react-hooks` | `^7.1.1` | Hook rules |
| `eslint-plugin-react-refresh` | `^0.5.3` | Refresh-safe export rules |
| `globals` | `^17.7.0` | Browser and Node global definitions |
| `tailwindcss` | `^4.3.3` | Utility CSS framework |
| `vite` | `^8.2.0` | Development and production build tool |

---

# Files Created

All current Feature 01 frontend source files are listed; ignored/generated `.env.local`, `node_modules/`, and `dist/` are excluded.

| File | Responsibility and interaction |
| --- | --- |
| `frontend/.env.example` | Documents the required public API base URL. |
| `frontend/.gitignore` | Excludes local environment, dependency, and build artifacts. |
| `frontend/README.md` | Frontend developer guide. |
| `frontend/eslint.config.js` | Applies browser rules to `src` and Node globals to config files. |
| `frontend/index.html` | Defines metadata, `#root`, and the ES-module entry script. |
| `frontend/package.json` | Declares npm scripts and direct dependencies. |
| `frontend/package-lock.json` | Locks the resolved npm dependency graph. |
| `frontend/vite.config.js` | Configures React, Tailwind, and build-time environment validation. |
| `frontend/src/main.jsx` | Imports global setup and mounts `App` inside Strict Mode. |
| `frontend/src/App.jsx` | Supplies the centralized router through `RouterProvider`. |
| `frontend/src/index.css` | Imports Tailwind and defines minimal base sizing. |
| `frontend/src/config/environment.js` | Validates, normalizes, and exports public runtime configuration. |
| `frontend/src/lib/apiClient.js` | Creates the shared Axios instance. |
| `frontend/src/layouts/RootLayout.jsx` | Renders shared header, outlet, and footer. |
| `frontend/src/routes/router.jsx` | Owns route objects, nesting, wildcard, and error boundary. |
| `frontend/src/pages/HomePage.jsx` | Renders the foundation milestone landing page. |
| `frontend/src/pages/NotFoundPage.jsx` | Renders wildcard-route recovery navigation. |
| `frontend/src/pages/RouteErrorPage.jsx` | Converts route errors into safe status-based UI. |

# Files Modified

```text
README.md
docs/Architecture.md
docs/Testing-Strategy.md
docs/Project-Status.md
```

These existing documents were incrementally synchronized during the documentation phase. ADR-021 and this Feature Report were newly created.

---

# Routing

| Route | Composition | Result |
| --- | --- | --- |
| `/` | Root route + index child | `RootLayout` renders `HomePage` in `Outlet`. |
| `*` | Root route + wildcard child | `RootLayout` renders `NotFoundPage`. |

`RouteErrorPage` is the root route’s `ErrorBoundary`. `Link` elements in the layout and recovery pages perform client-side navigation. The wildcard is normal not-found rendering; unexpected route errors use the error boundary.

# Environment Configuration

`.env.example` supplies `VITE_API_BASE_URL=http://127.0.0.1:8000/api`; developers copy it to ignored `.env.local`. Vite validates before development/build startup. Browser code validates again before exporting configuration. Values are trimmed, trailing slashes are removed, only absolute HTTP(S) URLs are accepted, and embedded username/password credentials are rejected. All `VITE_` values are public and must contain no secrets.

# API Client

`apiClient` is one Axios instance with the normalized `baseURL`, a `10_000` millisecond timeout, and `Accept: application/json`. It deliberately has no global `Content-Type`: Axios must generate multipart boundaries for future featured-image uploads and can select request content types per payload. JWT interceptors await Frontend Feature 02’s token-storage and refresh decisions.

# Styling

Tailwind CSS 4 is loaded through `@tailwindcss/vite` and `@import "tailwindcss"`. Global CSS owns only document/root sizing and body margin. Pages and layout use mobile-first utilities with `sm:` enhancements for responsive typography and spacing.

# Security Review

* Django remains authoritative for authentication, permissions, validation, ownership, and visibility.
* Browser environment variables are public; no secret belongs in `VITE_` configuration.
* Hidden navigation or future protected routes cannot grant or enforce permission.
* Route errors expose a controlled status and generic message, not raw error details.
* Future JWT integration must review token theft, expiry, refresh races, logout, and XSS exposure.
* React escaping helps with text rendering, but future HTML and URL inputs still require safe handling; unsafe HTML injection must be avoided.
* Token storage is intentionally deferred to Frontend Feature 02.

# Testing and Verification

Verified for Feature 01:

* Node `v24.18.0` and npm `11.16.0` were verified during documentation completion.
* Dependencies installed successfully; npm audit reported zero vulnerabilities at installation time.
* ESLint passed.
* The production build passed.
* Removing `VITE_API_BASE_URL` correctly caused Vite build-time validation to fail.
* Restoring environment configuration allowed lint and build to pass.
* `/` and the wildcard route were manually verified.
* Header and footer rendering were manually verified.
* Client-side Return home navigation was manually verified.
* `.env.local`, `node_modules`, and `dist` were confirmed ignored.

No automated React tests were written.

# Key Concepts

* **React entry point:** `main.jsx` locates `#root` and starts browser rendering.
* **Strict Mode:** development checks run around the component tree.
* **Vite and ES modules:** native module imports drive development and optimized builds.
* **SPA routing:** browser history changes render pages without full document navigation.
* **Route objects and nested/layout routes:** centralized objects compose shared UI with child screens.
* **`Outlet`:** marks where the matched child route renders.
* **Route error boundary:** handles unexpected routing/render failures safely.
* **Tailwind CSS:** utilities keep component styling colocated and responsive.
* **Environment variables:** `VITE_` values configure builds and are public in the bundle.
* **Build-time versus runtime validation:** one blocks invalid builds/startup; the other protects browser initialization.
* **Axios instances:** centralize request defaults without duplicating component policy.
* **Dependency versus devDependency:** runtime imports ship into reachable app code; build/lint tooling supports development.
* **Browser versus Node ESLint environments:** each file receives only globals valid for its runtime.
* **Tree shaking and dependency reachability:** the bundler removes unreachable exports; importing `apiClient.js` from the entry point ensures current validation/client setup remains reachable even before requests exist.

# Interview Questions

## Why create the router outside a component?

It preserves one router instance and avoids recreating navigation state on renders.

## Why validate the API URL twice?

Build-time validation fails early; runtime validation protects browser initialization if configuration reaches the bundle through another path.

## Why is frontend route protection insufficient?

Users can alter client code and send requests directly, so only backend authorization protects data and operations.

## Why omit a default `Content-Type`?

The payload determines the correct content type; multipart requests require an automatically generated boundary.

## Why defer Redux and TanStack Query?

The application has neither global client state nor real server-state synchronization requirements yet.

## What is the difference between a wildcard route and an error boundary?

The wildcard intentionally renders unknown URLs; the error boundary handles failures during route processing or rendering.

# Common Mistakes

* Hard-coding the backend URL
* Storing secrets in `VITE_` variables
* Creating the router inside a rendering component
* Treating route guards as authorization
* Setting a global JSON `Content-Type`
* Committing `.env.local`, `node_modules`, or `dist`
* Using Node globals in browser code
* Leaving Vite demo files in production code
* Installing state-management libraries before requirements exist
* Creating speculative empty architecture

# Refactoring Opportunities

Future requirements may justify route-based lazy loading, shared UI components, feature-oriented modules, an authentication provider, Axios interceptors, standard API error mapping, automated frontend tests, accessibility testing, and bundle analysis. These are opportunities, not current defects.

# Definition of Done

## Completed

* [x] React/Vite application starts from a clear entry point.
* [x] Data Mode router, nested root layout, Home, wildcard, and route error UI exist.
* [x] Tailwind Vite integration and minimal global CSS exist.
* [x] Required API URL is documented, validated twice, normalized, and kept public-only.
* [x] Shared Axios client has verified defaults and multipart-safe header behavior.
* [x] Browser and Node lint environments are separated.
* [x] Lint, build, manual routes, validation failure, and ignore rules were verified.
* [x] ADR, Feature Report, and affected project documentation were completed.

## Deferred

* [ ] Authentication, current-user state, JWT integration, and protected routes
* [ ] Real API requests and server-state tooling decision
* [ ] Automated frontend tests and accessibility automation

---

# Final Outcome

Frontend Feature 01 provides a small, validated, and extensible React foundation. It creates stable routing, styling, configuration, and HTTP boundaries without claiming authentication, authorization, or API behavior that has not yet been implemented.
