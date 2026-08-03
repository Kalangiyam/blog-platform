# ADR-020 — Collection Pagination and Stable Ordering Architecture

## Status

* **Status:** Accepted
* **Date:** 2026-08-03
* **Feature:** Feature 16 — Performance Optimization

---

# Context

The Blog Platform exposes several collection APIs with different growth and usage characteristics.

Before Feature 16, four public collections returned every matching record in one response:

```text
GET /api/posts/
GET /api/posts/{post_slug}/comments/
GET /api/categories/
GET /api/tags/
```

Search and Administrator User listing already used specialized page-number pagination. This created inconsistent response contracts and left the unpaginated endpoints vulnerable to increasing serialization, rendering, memory, transfer, and client-processing costs.

Runtime measurements confirmed that query counts were stable because Posts and Comments already used eager loading. The primary bottleneck was the unbounded number of serialized records. At 1,000 records, the Post list returned 697,920 bytes with an 887.226 ms median request time, while the Comment list returned 378,127 bytes with a 167.746 ms median request time.

Page-number pagination also requires deterministic ordering. Without a unique tie-breaker, rows with equal ordering values can move between pages as PostgreSQL selects among equivalent orderings.

The architecture needed to provide reusable pagination without silently changing every present and future DRF collection. A global pagination setting could affect endpoints whose contracts had not been reviewed.

---

# Decision

Feature 16 introduces a shared pagination class:

```text
StandardPageNumberPagination
```

It is defined in:

```text
backend/apps/core/pagination.py
```

The shared policy is:

```text
Default page size: 20
Client query parameter: page_size
Maximum page size: 100
```

The policy is explicitly adopted by:

```text
GET /api/posts/
GET /api/posts/{post_slug}/comments/
GET /api/categories/
GET /api/tags/
```

The affected list responses use the standard DRF envelope:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {}
  ]
}
```

This is an intentional breaking change from the previous plain-array contract.

Pagination is attached to ViewSets rather than implemented through custom `list()` methods. DRF therefore applies pagination only to list actions. Retrieve, create, update, delete, workflow, media, and Profile detail responses remain unpaginated.

No global `DEFAULT_PAGINATION_CLASS` or `PAGE_SIZE` setting is introduced.

---

# Specialized Pagination

Endpoints with different established requirements retain specialized classes.

Post search continues to use `PostSearchPagination`:

```text
Default page size: 10
Maximum page size: 50
```

Administrator User listing continues to use `UserAdministrationPagination`:

```text
Default page size: 20
Maximum page size: 100
```

The architecture is therefore:

```text
Shared pagination infrastructure
        +
Explicit endpoint-level adoption
        +
Specialized pagination where requirements differ
```

---

# Stable Ordering

Every newly paginated standard collection has deterministic ordering.

Posts use:

```text
-published_at
-created_at
-pk
```

The primary key is the final unique tie-breaker.

Comments retain:

```text
created_at
id
```

Categories retain alphabetical ordering by unique `name`.

Tags retain alphabetical ordering by unique `name`.

Administrator Users retain:

```text
-date_joined
-pk
```

Search currently orders by:

```text
-search_rank
-published_at
-created_at
-pk
```

The primary key provides a unique final tie-breaker when rank and timestamps are equal.

---

# Performance Basis

Pagination was selected after measuring real application querysets, serializers, routing, permissions, and PostgreSQL behavior.

At 1,000 published Posts, the default 20-record page produced:

```text
4 queries
32.033 ms median request time
12,288-byte response
```

At 1,000 active Comments, the default 20-record page produced:

```text
3 queries
20.766 ms median request time
12,239-byte response
```

Pagination adds a count query, but bounds page retrieval, related-object loading, serialization, rendering, payload size, and client processing.

The measurements are local verification evidence and are not production performance guarantees.

---

# Alternatives Considered

## Global DRF Pagination

Global pagination was rejected because it could silently change collection APIs that had not been audited. Explicit endpoint adoption keeps contract changes reviewable.

## Separate Pagination Class Per Domain

Duplicating the same `20/100` policy for Posts, Comments, Categories, and Tags was rejected because it would create unnecessary repetition and configuration drift.

## Leave Endpoints Unpaginated

This was rejected because measured Post and Comment payloads and request times grew with the complete result set.

## Cursor Pagination

Cursor pagination was deferred. It can improve deep traversal and consistency under concurrent writes, but it changes navigation semantics and does not provide the exact-count contract currently expected by clients.

## Paginate Only Posts and Comments

This was rejected as the final architecture. Categories and Tags were not urgent database bottlenecks, but bounded responses and a consistent collection contract reduce future integration and frontend complexity.

## One Pagination Policy for Every Endpoint

This was rejected because Search already has a smaller `10/50` policy and Administrator User listing has an established specialized class. Endpoint requirements are not identical.

---

# Consequences

## Positive Consequences

* Response sizes are bounded.
* Serialization and rendering work is bounded by page size.
* Collection contracts are consistent across standard endpoints.
* Pagination policy is reusable and centrally maintained.
* Endpoint adoption remains explicit.
* Stable ordering supports reliable page traversal.
* Existing eager loading continues to avoid N+1 query growth.
* Maximum page sizes protect against excessively large client requests.
* Specialized endpoint requirements remain supported.

## Negative Consequences

* Existing clients must adapt from arrays to pagination envelopes.
* Page-number pagination adds a count query.
* Clients must implement page navigation.
* Retrieving every Category or Tag may require multiple requests.
* Offset pagination can become inefficient for very deep pages.
* Exact counts may become expensive for very large search result sets.

---

# Security Considerations

Pagination operates after authentication, permission selection, and queryset scoping.

It does not replace or bypass:

* JWT authentication
* Author, Editor, or Administrator role checks
* Post ownership checks
* Comment ownership checks
* Published-only Post visibility
* Soft-delete exclusion
* Active-only taxonomy filtering
* Comment parent-Post scoping
* Private Profile protections
* User-administration service protections

Count and page queries operate on the already-scoped queryset.

---

# Future Considerations

* Evaluate cursor pagination if collections require efficient deep traversal.
* Add taxonomy autocomplete or search if multi-page selection becomes inconvenient.
* Monitor exact-count cost for large search datasets.
* Experiment with a stored `SearchVectorField` only if production-shaped measurements justify its write, storage, migration, and synchronization costs.
* Add automated pagination-contract, query-count, ordering, visibility, and performance regression tests during the backend testing phase.

---

# Decision Outcome

Feature 16 adopts shared, bounded page-number pagination through explicit endpoint-level configuration.

Posts, Comments, Categories, and Tags share the `20/100` policy. Search and Administrator User listing retain specialized policies. No global pagination setting is introduced.

The decision bounds collection responses while preserving authorization, visibility, eager loading, and endpoint-specific requirements.
