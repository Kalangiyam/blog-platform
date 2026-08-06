# ADR-023 — Frontend Public Posts Architecture

## Status

* **Status:** Accepted
* **Feature:** Frontend Feature 03 — Public Posts Module
* **Date:** 2026-08-06

---

# Context

The backend already exposes public, slug-addressed post list and detail APIs. List responses use DRF page-number pagination with a fixed default of 20 items and a stable `-published_at`, `-created_at`, `-pk` ordering. Both serializers expose request-built featured-image URLs, nested public author data, and category/tag summaries. Detail additionally exposes plain-text `content`.

The React application already has a central Data Mode router, root layout, shared Axios client, and authentication/session architecture. The first public domain module must integrate with those boundaries without adding global state, a cache dependency, authentication coupling, or a content-rendering vulnerability.

# Decision

## Feature Boundary

Public-post behavior lives under `src/features/posts/` in API, component, page, and utility layers. The module uses the existing shared Axios client and central router. It neither owns nor changes token handling, interceptors, Context, roles, backend visibility, or permissions.

## URL as Pagination Authority

The `/posts` location owns the current page. Page one has no query string; later pages use `?page=N`. Only one base-10 positive safe integer is accepted. Missing, malformed, repeated, and noisy parameters canonicalize with replace navigation. Backend list `404` for an out-of-range page also returns the browser to canonical page one.

Pagination links are navigable URLs rather than button-owned component state. Refresh, sharing, and browser back/forward therefore retain predictable behavior.

## Local Abortable Request State

List and detail request state remains local to their route pages. Each request accepts an `AbortSignal`; cleanup aborts superseded work, and active-request guards prevent stale or unmounted responses from updating the screen. Retry changes a local request key. No general cache or new global state is introduced until demonstrated synchronization requirements justify one.

## Safe Response Presentation

Post content is untrusted plain text. React text interpolation and preserved whitespace are used; HTML parsing and `dangerouslySetInnerHTML` are prohibited for this contract.

Featured images accept only absolute, credential-free HTTP(S) URLs. Missing, malformed, relative, credential-bearing, `data:`, `javascript:`, and failed-load sources use a controlled fallback. Relative normalization is intentionally absent because DRF supplies serializer request context on the public endpoints and therefore returns absolute media URLs.

Errors are reduced to posts-specific categories: cancelled, network, detail not found, invalid list page, other client failure, and server failure. UI receives only category codes and controlled copy, not raw Axios objects or backend diagnostics.

# Alternatives Considered

## Component-Only Page State

Rejected because URLs would not survive refresh, sharing, or back/forward navigation and could drift from the fetched page.

## New Global Store or Server-State Library

Rejected for the current scope. The two public screens do not require cross-route mutation, invalidation, optimistic updates, or shared cache coordination.

## Rendering Backend Content as HTML

Rejected because the backend contract is a text field and no sanitization/rendering contract exists. Treating it as markup would create an unnecessary XSS boundary.

## Blind Media-Base Prefixing

Rejected because the backend already returns absolute URLs and blind concatenation can produce broken or attacker-controlled destinations. If the backend contract later changes to relative media paths, a separately tested trusted-base resolver will be required.

## Parsing Backend `next` and `previous` URLs

Rejected because navigation is owned by the frontend route and known page-number contract. Constructing internal URLs locally avoids coupling browser navigation to backend hostnames.

# Consequences

## Advantages

* Public routes remain bookmarkable and browser-native.
* Strict Mode replay and rapid navigation cannot allow stale data to replace current route data.
* The module stays independent of authentication implementation details.
* No new state or caching dependency is added prematurely.
* Backend text cannot execute as markup.
* Unsafe image schemes and embedded credentials never reach an image source.
* Backend pagination and visibility remain authoritative.

## Trade-offs

* Navigating back to an earlier page refetches because no response cache is retained.
* The UI relies on the backend standard page size of 20 while sending no custom `page_size`.
* Relative image URLs intentionally fall back rather than being guessed.
* Full rich-text rendering requires a future explicit content format and sanitization decision.

# Verification

Feature 03 adds 31 focused tests covering the API boundary, utilities, cards, route pages, pagination, race handling, routing, and hostile content. The complete frontend suite passes 166 tests across 18 files; ESLint and the Vite production build also pass.

Interactive browser verification is documented as pending because no browser session with a seeded running backend was available during this implementation. No manual result is inferred from automated tests.
