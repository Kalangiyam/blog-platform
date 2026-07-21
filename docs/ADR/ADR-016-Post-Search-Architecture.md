# ADR-016 — Post Search Architecture

## Status

- **Status:** Accepted
- **Date:** 2026-07-21
- **Feature:** Feature 12 — Search

---

# Context

The Blog Platform required a scalable and production-ready search capability that allows readers to quickly discover published content.

Initially, a simple substring search using Django's `icontains` lookup was considered because it is database-independent and easy to understand.

However, substring search has several limitations:

- Poor relevance ranking
- No language awareness
- No stemming
- Limited scalability
- Expensive wildcard searches on large datasets

The project uses PostgreSQL as its primary database, making PostgreSQL Full-Text Search a natural production-ready solution.

The implementation needed to satisfy the following business requirements:

- Search published posts only
- Exclude soft-deleted posts
- Search across title, excerpt, and content
- Return results ordered by relevance
- Remain extensible for future search enhancements
- Keep the public API stable regardless of the internal search implementation

---

# Decision

The search feature follows these architectural decisions.

---

## Dedicated Search Endpoint

A dedicated endpoint was introduced:

```text
GET /api/posts/search/?q=<query>
```

instead of extending the existing post listing endpoint.

### Benefits

- Explicit API purpose
- Easier maintenance
- Independent evolution
- Clear separation between browsing and searching
- Simpler future enhancements

---

## QuerySet-Based Search Logic

Search logic is implemented inside a dedicated `PostQuerySet`.

Responsibilities:

- Published filtering
- Search implementation
- Database querying

Views remain responsible only for HTTP request handling.

### Benefits

- Reusable query logic
- Better separation of concerns
- Easier testing
- Cleaner API views

---

## Custom Post Manager

A dedicated `PostManager` exposes reusable query methods while preserving the shared soft-delete behavior inherited from the core application.

Examples:

```python
Post.objects.published()

Post.objects.published().search(query)
```

### Benefits

- Reusable business rules
- Consistent visibility logic
- Cleaner view implementation

---

## PostgreSQL Full-Text Search

The project adopts PostgreSQL Full-Text Search using:

- SearchVector
- SearchQuery
- SearchRank

instead of relying on `icontains`.

### Benefits

- Better performance
- Language-aware searching
- Search ranking
- Production scalability

---

## Weighted Search

Different business importance is assigned to searchable fields.

| Field | Weight |
|--------|--------|
| Title | A |
| Excerpt | B |
| Content | C |

This prioritizes title matches over content matches.

### Benefits

- More relevant search results
- Better user experience
- Flexible ranking strategy

---

## Web Search Query Parsing

Search queries use:

```python
SearchQuery(
    query,
    search_type="websearch",
)
```

This provides user-friendly search behavior.

Supported examples:

- Multiple words
- Phrase search
- Excluded terms
- OR expressions

### Benefits

- Natural search syntax
- Better usability
- Improved search flexibility

---

## Explicit Search Configuration

The implementation explicitly specifies the PostgreSQL search configuration instead of relying on the database default.

Example:

```python
config=POST_SEARCH_CONFIG
```

Current configuration:

```text
english
```

### Benefits

- Consistent behavior across environments
- Predictable search results
- Easier future localization

---

## Search Pagination

Search results use a dedicated pagination class.

This avoids changing the response structure of existing list endpoints while providing scalable search responses.

### Benefits

- Incremental architecture evolution
- Reduced regression risk
- Independent pagination policy

---

## GIN Index

A PostgreSQL GIN Index is added using the same weighted `SearchVector` expression used during searching.

### Benefits

- Faster search performance
- Efficient index lookups
- Improved scalability

---

# Consequences

## Positive

- Production-grade search
- Better relevance ranking
- Clean architecture
- Reusable QuerySets
- Stable API contract
- PostgreSQL optimization
- Future extensibility
- Improved maintainability

---

## Negative

- PostgreSQL-specific implementation
- Database portability reduced
- Additional database index maintenance
- More advanced search concepts to understand

---

# Alternatives Considered

## DRF SearchFilter

Rejected.

Reasons:

- Limited flexibility
- Limited relevance ranking
- Harder future customization
- Less explicit API design

---

## Django `icontains`

Initially implemented as a learning step.

Rejected as the final solution because:

- No ranking
- Poor scalability
- No linguistic processing
- Expensive wildcard queries

---

## External Search Engines

Examples:

- Elasticsearch
- OpenSearch
- Meilisearch
- Typesense

Deferred.

Reasons:

- Additional infrastructure
- Increased operational complexity
- Unnecessary for the current project stage

The current PostgreSQL implementation provides sufficient production capability for the expected project scope.

---

# Future Considerations

Potential future improvements include:

- Search suggestions
- Autocomplete
- Search highlighting
- Category filtering
- Tag filtering
- Author filtering
- Date filters
- Multilingual search
- Search analytics
- External search engine integration if required by future scale

---

# Decision Summary

The project adopts PostgreSQL Full-Text Search implemented through a dedicated search endpoint, reusable QuerySets, custom managers, weighted search ranking, explicit search configuration, and GIN indexing.

This architecture provides a maintainable, scalable, and production-ready search solution while preserving a stable public API and enabling future search enhancements without architectural redesign.