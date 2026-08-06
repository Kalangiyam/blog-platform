import { Link, useLocation } from 'react-router'

import { buildCommentsSearch } from '../utils/commentPagination.js'

function CommentPageLink({ children, searchParams, targetPage, ...props }) {
  const location = useLocation()
  const search = buildCommentsSearch(searchParams, targetPage)
  const to = `${location.pathname}${search}`

  return (
    <Link
      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      to={to}
      {...props}
    >
      {children}
    </Link>
  )
}

export default function CommentPagination({
  count,
  currentPage,
  pageSize = 20,
  searchParams,
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      aria-label="Comments pagination"
      className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4"
    >
      <div>
        <p className="text-xs text-slate-500">
          Page <span className="font-medium text-slate-700">{currentPage}</span>{' '}
          of{' '}
          <span className="font-medium text-slate-700">{totalPages}</span> (
          {count} total {count === 1 ? 'comment' : 'comments'})
        </p>
      </div>

      <div className="flex gap-x-2">
        {currentPage > 1 ? (
          <CommentPageLink
            searchParams={searchParams}
            targetPage={currentPage - 1}
          >
            Previous
          </CommentPageLink>
        ) : (
          <span className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-400 cursor-not-allowed">
            Previous
          </span>
        )}

        {currentPage < totalPages ? (
          <CommentPageLink
            searchParams={searchParams}
            targetPage={currentPage + 1}
          >
            Next
          </CommentPageLink>
        ) : (
          <span className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-400 cursor-not-allowed">
            Next
          </span>
        )}
      </div>
    </nav>
  )
}
