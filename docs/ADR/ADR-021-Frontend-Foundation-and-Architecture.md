# ADR-021 — Frontend Foundation and Architecture

## Status

* **Status:** Accepted
* **Date:** 2026-08-05
* **Feature:** Frontend Feature 01 — React Foundation & Frontend Architecture

---

# Context

The completed Django REST Framework backend needs an independently built browser client. The first frontend milestone must establish predictable startup, routing, styling, configuration, and HTTP-client boundaries without prematurely implementing authentication, API-driven screens, or speculative state layers.

Vite exposes `VITE_` values to browser code, so configuration must fail clearly when the API URL is absent or unsafe. The shared HTTP boundary must also remain compatible with future JSON and multipart requests.

---

# Decision

## Build System

The frontend uses React 19 with Vite 8 and JavaScript. JavaScript keeps this project aligned with the current implementation and JavaScript keeps the project aligned with the current implementation and avoids introducing TypeScript and its additional configuration during the foundation milestone. npm manages dependencies and `package-lock.json` is retained for reproducible resolution.

## Styling

Tailwind CSS 4 is integrated through the first-party `@tailwindcss/vite` plugin. `src/index.css` imports Tailwind and owns only document/root minimum sizing and body margin. Components use mobile-first utility classes, adding responsive variants only where the layout changes.

## Routing

React Router 8 Data Mode is configured once with `createBrowserRouter` in `src/routes/router.jsx`. A nested root route renders `RootLayout`, while `Outlet` renders the index Home page or wildcard Not Found page. `RouteErrorPage` is the route-level error boundary. Links provide client-side navigation without rebuilding the router during rendering.

## API Communication

Axios is exposed through one shared instance in `src/lib/apiClient.js`. It uses the normalized environment API base URL, a 10-second timeout, and `Accept: application/json`. No global `Content-Type` is set because Axios must be able to select the correct boundary for future multipart image uploads. JWT interceptors are intentionally deferred to Frontend Feature 02.

## Configuration

`VITE_API_BASE_URL` is required. `.env.example` documents a local value and `.env.local` is ignored. `vite.config.js` validates configuration at build/config-load time; `src/config/environment.js` repeats validation in browser runtime and removes trailing slashes. Both accept only absolute HTTP or HTTPS URLs and reject embedded credentials.

Vite variables are public browser configuration, never secrets. The duplicated validation intentionally protects both build startup and browser execution boundaries.

## State Management

No Redux, TanStack Query, or global application state is introduced. Context API is reserved for authentication in Frontend Feature 02. A server-state library will be considered only after real API integration demonstrates caching or synchronization requirements.

## Folder Architecture

The implemented folders are:

```text
src/config/   Environment configuration
src/layouts/  Shared route layouts
src/lib/      Shared infrastructure clients
src/pages/    Route-level screens
src/routes/   Central route composition
```

Feature-oriented folders may be introduced when a feature owns real behavior. Empty speculative layers are not created.

---

# Architecture

```text
index.html
    ↓
src/main.jsx (StrictMode and React root)
    ↓
App.jsx (RouterProvider)
    ↓
routes/router.jsx
    ↓
RootLayout.jsx → Outlet → HomePage / NotFoundPage
              ↘ RouteErrorPage on route failure
```

```text
.env.local / process environment
    ↓
Vite build-time validation
    ↓
import.meta.env
    ↓
browser-runtime validation and normalization
    ↓
shared Axios instance
    ↓
Django REST API (future requests)
```

No real API request is made by Feature 01.

---

# Alternatives Considered

## Create React App

Not selected because Vite provides the current project’s simpler ES-module development and production build workflow, while Create React App would add an obsolete scaffold direction.

## Next.js

Not selected because server rendering, framework routing, and a Node application server are not current requirements for this separate API client.

## React Router Declarative Mode

Not selected because centralized Data Mode route objects provide layout nesting and route error boundaries while leaving room for data-router capabilities.

## Redux Toolkit

Deferred because Feature 01 has no shared application state. Adding a store now would create ceremony without behavior.

## TanStack Query

Deferred until real API integration establishes server-state caching and invalidation needs.

## Direct Global Axios Imports in Components

Rejected because repeated imports and per-component configuration would fragment base URL, timeout, headers, and future authentication/error policies.

## Hard-Coded API URLs

Rejected because deployment environments require configuration without source edits.

## Vite Development Proxy

Not selected because it would solve only local development and could hide the real frontend-to-backend origin boundary. An explicit API URL works consistently across environments.

## Tailwind v3-Style Configuration

Not selected because Tailwind 4 and its Vite integration do not require speculative `tailwind.config.js` and PostCSS files for the current styling.

## Heavily Layered Enterprise Architecture

Rejected because empty services, stores, hooks, and feature modules would imply responsibilities that do not exist. Structure will grow with implemented behavior.

---

# Consequences

## Advantages

* Fast, explicit development and production builds.
* One discoverable router and HTTP-client boundary.
* Early failure for missing or unsafe configuration.
* Responsive styling without a large global stylesheet.
* Low architectural overhead while the frontend is small.

## Disadvantages

* JavaScript provides no compile-time application type checking.
* Build-time and runtime URL validation are intentionally duplicated.
* Browser-history routes require host fallback configuration during deployment.
* Authentication and server-state patterns remain unresolved until their requirements exist.
* Importing the shared API client during application startup includes Axios in the initial JavaScript bundle before real API requests exist.

## Risks

* Developers may mistake `VITE_` values for secrets.
* Future code may bypass the shared Axios instance.
* Client-side route visibility may be mistaken for authorization.
* The initial bundle may grow without later route-based splitting.

---

# Security Considerations

The backend remains authoritative for authentication, authorization, validation, and data visibility. Frontend route guards and hidden links are user-experience controls, not permissions. No secret may be stored in a Vite variable. Route errors display controlled messages rather than raw internal error objects. Token storage and JWT behavior require a dedicated Frontend Feature 02 security decision.

# Scalability Considerations

Central routes, configuration, and HTTP infrastructure support incremental growth. Route lazy loading, feature modules, server-state tooling, and bundle analysis can be added when measured complexity or bundle size warrants them.

# Maintainability Considerations

Each current folder has one clear responsibility. Shared configuration prevents URL drift; the Axios instance prevents request-policy duplication; Node and browser ESLint environments prevent accidental cross-runtime globals. New layers must own implemented behavior.

# Testing and Verification

The foundation was verified with dependency installation, an installation-time zero-vulnerability audit result, ESLint, a production build, deliberate missing-environment build failure, restored-environment success, manual Home and wildcard routing checks, shared header/footer checks, return-home navigation, and Git ignore checks. Node `v24.18.0` and npm `11.16.0` were verified for this documentation pass. No automated React tests exist yet.

# Future Implications

Frontend Feature 02 will decide token storage, introduce authentication context and current-user state, and integrate Axios authentication behavior. Later features may introduce feature-oriented modules, standardized API errors, automated tests, accessibility checks, lazy routes, and server-state tooling based on demonstrated needs. When feature-level API integration begins, startup environment validation may be separated from Axios initialization so the HTTP client is loaded only by features that require it.
