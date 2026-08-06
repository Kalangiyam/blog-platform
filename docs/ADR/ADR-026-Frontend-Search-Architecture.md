# ADR-026: Frontend Search Architecture

* **Status:** Accepted
* **Date:** 2026-08-06
* **Author:** Engineering Team
* **Feature:** Frontend Feature 06 — Search Module

---

## Context

The backend blog platform implements a high-performance PostgreSQL Full-Text Search API endpoint (`GET /api/posts/search/?q=<query>&page=<page>`) for querying published posts.

The frontend requires a public search experience that is intuitive, accessible, performant, and deep-linkable. Users must be able to search for published posts from anywhere in the application, share search result URLs, navigate pagination seamlessly, and recover gracefully from network or query validation errors.

---

## Decision

We decided to implement the frontend search module using the following architectural choices:

### 1. URL-Owned Search State

The canonical search state (`q` and `page`) is strictly owned by the browser URL (`/search?q=django` or `/search?q=django&page=2`).

* Submitted search state is **never** duplicated into React Context, Redux, or localStorage.
* The URL is the single source of truth for deep linking, browser back/forward history, page refreshes, and sharing.
* Canonical URLs omit `page=1` (`/search?q=django` instead of `/search?q=django&page=1`).
* Malformed or out-of-range page query parameters automatically canonicalize via replacement navigation without polluting browser history.

### 2. Explicit Form Submission Strategy

The search UI uses local input state for draft typing and triggers an API request only upon explicit form submission (Enter key press or clicking the Submit button).

* **No search-as-you-type or debounced live search** is used for this phase.
* **Rationale:** Explicit submission provides predictable URL navigation, eliminates unnecessary API requests, preserves clean browser history, simplifies accessibility, and simplifies testing.

### 3. Feature-Based Architecture and Module Boundary

Search logic is modularized in `frontend/src/features/search/` with clear responsibility separation:

* `api/searchApi.js`: Dedicated search adapter reusing the shared `apiClient` instance and forwarding `AbortSignal`.
* `utils/searchParams.js`: Pure functions for search query parsing, validation, canonical path building, and pagination calculations.
* `utils/searchErrors.js`: `SearchError` class and normalization function ensuring raw Axios errors, stack traces, or server implementation details are never exposed to the UI.
* `components/GlobalSearchForm.jsx`: Accessible header search form with client-side query validation.
* `components/SearchResultsList.jsx`: Presentational list rendering results by composing the existing `PostCard` component.
* `components/SearchPagination.jsx`: Accessible pagination component preserving the search query parameter in page URLs.
* `pages/SearchResultsPage.jsx`: Search page component orchestrating URL state, lifecycle management, cancellation, and state rendering.

### 4. Request Cancellation and Race Protection

* Every search API request forwards an `AbortSignal` created via `AbortController`.
* Active requests are cancelled whenever the query or page changes, or when the component unmounts.
* Stale response updates are ignored to prevent race conditions where a slower request supersedes a newer query.

### 5. Public Access Control

Search is completely public and read-only. The `/search` route is not wrapped in authentication guards, allowing both anonymous visitors and authenticated users across all roles (Authors, Editors, Admins) to perform search queries.

---

## Alternatives Considered

1. **Local-Only Search State (useState)**
   * *Rejected:* Breaks refresh, bookmarking, and deep-linking capabilities.

2. **Global Store (Redux / Context)**
   * *Rejected:* Violates project architecture principles (No Redux/TanStack Query) and creates state synchronization issues with the URL.

3. **Debounced Search-as-You-Type**
   * *Rejected:* Generates rapid intermediate network calls, pollutes browser history, and complicates keyboard accessibility.

4. **Client-Side Filtering of All Posts**
   * *Rejected:* Inefficient for large datasets and bypasses PostgreSQL Full-Text Search ranking.

---

## Consequences

### Positive

* Clean, deep-linkable URLs supporting sharing and bookmarking.
* Zero external data-fetching or state-management dependencies added.
* Strict request cancellation and race-condition safety.
* Accessible loading, empty, error, and pagination states.
* Reuses existing `PostCard` and `apiClient` without duplicating business logic.

### Negative / Limitations

* No instant live search suggestions while typing (deferred as a future enhancement).
* Search result ranking depends entirely on backend PostgreSQL scoring.
