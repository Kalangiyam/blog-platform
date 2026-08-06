# Frontend Feature 03 — Public Posts Module

## Status

**Complete:** implementation, automated verification, architecture records, and project documentation are complete. Interactive browser verification remains explicitly pending.

## Business Outcome

Anonymous and authenticated visitors can browse published posts at `/posts`, navigate paginated results using shareable URLs, and read a published post at `/posts/:postSlug`. The screens consume the backend's existing public visibility rules and exact serializer representations without introducing a parallel source of authorization or publication truth.

## Architecture Summary

The feature is isolated in `src/features/posts/`. API adapters use the existing Axios client; route pages own only their request state; query parameters own list pagination; components own display behavior; utilities own deterministic page, date, error, and image handling. No backend, auth, global-state, or dependency change was required.

The accepted durable decisions are recorded in ADR-023:

* page state is canonical browser state;
* page one is `/posts`, later pages use `?page=N`;
* requests are abortable and stale responses are ignored;
* current screen state is local rather than globally cached;
* post content is rendered as text, never parsed as HTML;
* image sources must be credential-free absolute HTTP(S) URLs.

## Backend Contracts Consumed

### List

```text
GET /api/posts/?page=N
```

The adapter returns the DRF `count`, `next`, `previous`, and `results` body. Each result uses `id`, `title`, `slug`, `excerpt`, `featured_image_url`, `author`, `published_at`, `categories`, and `tags`. The client does not send `page_size`; it uses the backend standard of 20 for page-count presentation.

### Detail

```text
GET /api/posts/{encoded-slug}/
```

Detail uses the list representation plus `content`, `status`, `created_at`, and `updated_at`. A public-queryset `404` maps to a dedicated post-not-found screen.

## Implemented User Experience

The list route includes:

* primary-navigation access;
* loading, successful result, empty, retryable error, and invalid-page recovery states;
* cards with image/fallback, title link, excerpt, author, publication date, categories, and tags;
* previous, next, and bounded direct-page links;
* replace-canonicalization for malformed, repeated, page-one, noisy, and out-of-range queries;
* refresh and back/forward-safe URL behavior.

The detail route includes:

* loading, success, retryable failure, and dedicated `404` states;
* title, author, publication date, excerpt, taxonomy, featured image/fallback, and complete text content;
* a return link to the list;
* responsive semantic markup and visible keyboard focus styles.

## Error and Race Handling

The posts error boundary distinguishes cancelled requests, network failures, detail not-found, invalid list pages, other client responses, and server responses. Raw Axios requests, responses, backend details, stack traces, and credentials are not stored in page state or displayed.

Both route effects pass `AbortSignal` to Axios, abort on cleanup, and check active ownership before state updates. Request keys make a page/slug change or retry display loading immediately without a synchronous effect reset. A focused test confirms an older list response cannot overwrite a newer page.

## Security Review

* Post content uses React text interpolation with preserved whitespace; hostile `<script>` and event-handler strings remain inert text.
* `dangerouslySetInnerHTML` is not used.
* Featured images allow only absolute HTTP(S) URLs without embedded credentials.
* `javascript:`, `data:`, malformed, missing, relative, credential-bearing, and failed-load image sources use a fallback.
* Slugs are encoded before entering API paths.
* Public routes contain no role, token, or permission logic.
* Backend publication, deletion, and queryset visibility remain authoritative.

## Files Created

```text
frontend/src/features/posts/api/postsApi.js
frontend/src/features/posts/api/postsApi.test.js
frontend/src/features/posts/components/PostCard.jsx
frontend/src/features/posts/components/PostCard.test.jsx
frontend/src/features/posts/components/PostImage.jsx
frontend/src/features/posts/components/PostPagination.jsx
frontend/src/features/posts/components/PostRequestError.jsx
frontend/src/features/posts/components/PostTaxonomy.jsx
frontend/src/features/posts/pages/PostDetailPage.jsx
frontend/src/features/posts/pages/PostDetailPage.test.jsx
frontend/src/features/posts/pages/PostListPage.jsx
frontend/src/features/posts/pages/PostListPage.test.jsx
frontend/src/features/posts/utils/postDates.js
frontend/src/features/posts/utils/postErrors.js
frontend/src/features/posts/utils/postMedia.js
frontend/src/features/posts/utils/postPagination.js
frontend/src/features/posts/utils/postUtils.test.js
frontend/src/routes/router.test.jsx
docs/ADR/ADR-023-Frontend-Public-Posts-Architecture.md
docs/feature/Frontend-Feature-03-Public-Posts-Module.md
```

## Files Modified

```text
frontend/src/layouts/RootLayout.jsx
frontend/src/routes/router.jsx
README.md
frontend/README.md
docs/Architecture.md
docs/API-Specification.md
docs/Testing-Strategy.md
docs/Project-Status.md
```

No backend file, package manifest, lockfile, database design, authentication-flow file, migration, or deployment configuration changed.

## Automated Verification

Commands were run from `frontend/` on 2026-08-06:

```text
npm run test -- src/features/posts src/routes/router.test.jsx
6 test files passed; 31 tests passed

npm run test
18 test files passed; 166 tests passed

npm run lint
passed

npm run build
passed; 168 modules transformed
```

The focused coverage includes API contracts, error normalization, page/date/media utilities, card output, URL canonicalization, pagination, empty/error/retry states, out-of-range recovery, stale-response suppression, detail `404`, hostile-content regression, and route matching.

## Manual Verification Checklist

The following checks require an interactive browser plus a running backend with representative published data. They were not available in this execution environment and are therefore **pending**, not passed:

* [ ] anonymous `/posts` loading, result, and empty states;
* [ ] direct, next, and previous pagination;
* [ ] refresh on `/posts?page=2`;
* [ ] browser back/forward between pages and detail;
* [ ] malformed, repeated, noisy, and out-of-range page URLs;
* [ ] post detail success and public `404`;
* [ ] missing, broken, and valid featured images;
* [ ] transient list/detail retry behavior;
* [ ] mobile, tablet, and desktop layout;
* [ ] keyboard navigation and visible focus;
* [ ] network panel confirms only expected public requests;
* [ ] console remains free of runtime errors and token/content leakage.

## Documentation Review

Updated: root README, frontend README, Architecture, API Specification, Testing Strategy, Project Status, ADR inventory by adding ADR-023, and the feature report inventory by adding this report.

Reviewed and unchanged:

* `docs/Database-Design.md` — no model or persistence change;
* `docs/Authentication-Flow.md` — no token, session, role, guard, or permission-flow change.

## Known Trade-offs and Follow-up

List/detail responses are intentionally not cached, so revisiting a route refetches. Relative image paths intentionally fall back because the current request-aware backend contract returns absolute URLs. Rich text is not supported; adding it requires a separate format and sanitization decision. Interactive browser verification should be completed when the frontend and a seeded backend can be run together.

The next frontend feature is not assumed. Deployment and CI/CD remain deferred until backend and frontend development are complete.

## Definition of Done

* [x] Exact public list/detail contracts implemented.
* [x] Public routes and navigation integrated.
* [x] URL-backed pagination and normalization implemented.
* [x] Loading, empty, error, retry, and not-found states implemented.
* [x] Abort and stale-response protections implemented.
* [x] Plain-text/XSS and image URL protections implemented.
* [x] Focused and full automated verification passed.
* [x] ADR-023 and documentation updates completed.
* [ ] Interactive browser checklist completed when the required runtime is available.
