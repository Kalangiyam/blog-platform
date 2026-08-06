import { Link } from 'react-router'

import {
  getPostsSearch,
  getVisiblePostPages,
} from '../utils/postPagination.js'

function PageLink({ children, page, ...props }) {
  return (
    <Link
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      to={`/posts${getPostsSearch(page)}`}
      {...props}
    >
      {children}
    </Link>
  )
}

function PostPagination({ count, currentPage, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label="Posts pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 ? <PageLink page={currentPage - 1}>Previous</PageLink> : null}

      {getVisiblePostPages(currentPage, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span aria-hidden="true" className="px-1 text-slate-400" key={item}>...</span>
        ) : (
          <PageLink
            aria-current={item === currentPage ? 'page' : undefined}
            key={item}
            page={item}
          >
            <span className="sr-only">Page </span>{item}
          </PageLink>
        ),
      )}

      {currentPage < totalPages ? <PageLink page={currentPage + 1}>Next</PageLink> : null}
    </nav>
  )
}

export default PostPagination
