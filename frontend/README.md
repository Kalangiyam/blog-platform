# Blog Platform Frontend

The React single-page application for the Production-Grade Blog Platform. Frontend Feature 01 provides the browser foundation; authentication and real API requests are not implemented yet.

## Technology Stack

* React 19
* Vite 8
* React Router 8 Data Mode
* Tailwind CSS 4 with the first-party Vite plugin
* Axios 1
* ESLint 10
* JavaScript and npm

## Current Architecture

```text
index.html → src/main.jsx → App.jsx → RouterProvider
                                      ↓
                               routes/router.jsx
                                      ↓
                       RootLayout → Outlet → page

.env.local → Vite validation → environment.js → apiClient.js
```

Folder responsibilities:

```text
src/config/   Validated public runtime configuration
src/layouts/  Shared route shells
src/lib/      Shared infrastructure such as Axios
src/pages/    Route-level screens
src/routes/   Central route composition
```

New feature-oriented folders should be added only when they own implemented behavior.

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

`src/routes/router.jsx` creates one Data Mode browser router at module scope. The `/` root renders `RootLayout`, whose `Outlet` renders the Home index route. `*` renders the custom Not Found page. The root route also owns `RouteErrorPage` as its error boundary. `Link` supplies client-side navigation.

| Path | Page |
| --- | --- |
| `/` | Home |
| `*` | Not Found |

Hosts will eventually need SPA history fallback so direct browser requests reach `index.html`.

## API Client Architecture

`src/config/environment.js` validates and normalizes the public API URL. `src/lib/apiClient.js` creates one Axios instance with the configured base URL, a 10-second timeout, and `Accept: application/json`.

There is intentionally no global `Content-Type`; Axios must be able to create multipart boundaries for future image uploads. JWT interceptors await Frontend Feature 02.

## Security Notes

The Django backend remains authoritative for authentication, authorization, validation, and visibility. Client-side route visibility cannot enforce permissions. Route error UI uses controlled messages and does not render raw error details. Avoid unsafe HTML injection and never store secrets in frontend environment variables.

## Current Limitations

* No login or logout UI
* No authentication context or token-storage strategy
* No protected routes or role-aware navigation
* No real backend API requests
* No automated React tests
* No shared component library or feature modules yet

## Next Frontend Milestone

Frontend Feature 02 — Authentication & Session Architecture will design login, current-user state, token storage and refresh behavior, Axios authentication integration, logout, protected routing, role-aware navigation, error handling, and testing.
