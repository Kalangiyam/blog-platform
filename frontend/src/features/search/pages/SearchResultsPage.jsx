import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { searchPosts } from '../api/searchApi.js'
import SearchEmptyState from '../components/SearchEmptyState.jsx'
import SearchNoResults from '../components/SearchNoResults.jsx'
import SearchPagination from '../components/SearchPagination.jsx'
import SearchRequestError from '../components/SearchRequestError.jsx'
import SearchResultsList from '../components/SearchResultsList.jsx'
import SearchSkeleton from '../components/SearchSkeleton.jsx'
import { SEARCH_ERROR_CODES } from '../utils/searchErrors.js'
import {
  buildSearchPath,
  isCanonicalSearchUrl,
  parseSearchPage,
  parseSearchQuery,
} from '../utils/searchParams.js'

function SearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const query = parseSearchQuery(searchParams)
  const page = parseSearchPage(searchParams)

  const [status, setStatus] = useState('loading')
  const [data, setData] = useState({ count: 0, next: null, previous: null, results: [] })
  const [error, setError] = useState(null)
  const [retryToken, setRetryToken] = useState(0)

  const effectiveStatus = !query || query.length < 2 ? 'idle' : status

  // Canonicalize URL if params differ from canonical structure (e.g. ?q=django&page=1 or ?q=django&page=abc)
  useEffect(() => {
    if (query && query.length >= 2 && !isCanonicalSearchUrl(searchParams, query, page)) {
      navigate(buildSearchPath(query, page), { replace: true })
    }
  }, [searchParams, query, page, navigate])

  const handleRetry = useCallback(() => {
    setRetryToken((count) => count + 1)
  }, [])

  useEffect(() => {
    if (!query || query.length < 2) {
      return undefined
    }

    let isSubscribed = true
    const controller = new AbortController()

    searchPosts(query, page, { signal: controller.signal })
      .then((res) => {
        if (isSubscribed && !controller.signal.aborted) {
          setData(res)
          setStatus('success')
        }
      })
      .catch((err) => {
        if (!isSubscribed || controller.signal.aborted || err.code === SEARCH_ERROR_CODES.CANCELLED) {
          return
        }

        if (err.code === SEARCH_ERROR_CODES.INVALID_PAGE && page > 1) {
          navigate(buildSearchPath(query, 1), { replace: true })
          return
        }

        setError(err)
        setStatus('error')
      })

    return () => {
      isSubscribed = false
      controller.abort()
    }
  }, [query, page, retryToken, navigate])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Search Results
        </h1>
        {query ? (
          <p className="mt-2 text-base text-slate-600">
            Showing search results for &ldquo;<span className="font-semibold text-slate-900">{query}</span>&rdquo;
            {data.count > 0 ? ` (${data.count} ${data.count === 1 ? 'post' : 'posts'} found)` : ''}
          </p>
        ) : (
          <p className="mt-2 text-base text-slate-600">
            Find articles across our entire published library.
          </p>
        )}
      </header>

      {effectiveStatus === 'idle' ? <SearchEmptyState /> : null}

      {effectiveStatus === 'loading' ? <SearchSkeleton /> : null}

      {effectiveStatus === 'error' ? (
        <SearchRequestError error={error} onRetry={handleRetry} />
      ) : null}

      {effectiveStatus === 'success' && data.results.length === 0 ? (
        <SearchNoResults query={query} />
      ) : null}

      {effectiveStatus === 'success' && data.results.length > 0 ? (
        <>
          <SearchResultsList posts={data.results} />
          <SearchPagination
            count={data.count}
            currentPage={page}
            pageSize={10}
            query={query}
          />
        </>
      ) : null}
    </div>
  )
}

export default SearchResultsPage
