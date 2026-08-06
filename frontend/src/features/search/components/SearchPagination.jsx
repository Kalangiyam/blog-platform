import { Link } from 'react-router'

import { buildSearchPath, getVisibleSearchPages } from '../utils/searchParams.js'

function SearchPageLink({ children, page, query, ...props }) {
  return (
    <Link
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      to={buildSearchPath(query, page)}
      {...props}
    >
      {children}
    </Link>
  )
}

function SearchPagination({ count, currentPage, pageSize = 10, query }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label="Search pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 ? (
        <SearchPageLink page={currentPage - 1} query={query}>
          Previous
        </SearchPageLink>
      ) : null}

      {getVisibleSearchPages(currentPage, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span aria-hidden="true" className="px-1 text-slate-400" key={item}>
            ...
          </span>
        ) : (
          <SearchPageLink
            aria-current={item === currentPage ? 'page' : undefined}
            key={item}
            page={item}
            query={query}
          >
            <span className="sr-only">Page </span>
            {item}
          </SearchPageLink>
        ),
      )}

      {currentPage < totalPages ? (
        <SearchPageLink page={currentPage + 1} query={query}>
          Next
        </SearchPageLink>
      ) : null}
    </nav>
  )
}

export default SearchPagination
