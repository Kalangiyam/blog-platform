import { Link } from 'react-router'

function getVisiblePages(currentPage, totalPages) {
  const pages = []
  const maxVisible = 5

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (currentPage > 3) {
      pages.push('ellipsis-start')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis-end')
    }
    pages.push(totalPages)
  }

  return pages
}

function PageLink({ children, page, ...props }) {
  return (
    <Link
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      to={page === 1 ? '/admin/users' : `/admin/users?page=${page}`}
      {...props}
    >
      {children}
    </Link>
  )
}

/**
 * Accessible, URL-backed pagination controls for the Administrator user list.
 *
 * @param {Object} props
 * @param {number} props.count Total number of users
 * @param {number} props.currentPage Active page number
 * @param {number} [props.pageSize=20] Number of users per page
 */
export default function AdminPagination({ count, currentPage, pageSize = 20 }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  if (totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <nav aria-label="User administration pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 ? (
        <PageLink page={currentPage - 1}>Previous</PageLink>
      ) : null}

      {visiblePages.map((item) =>
        typeof item === 'string' ? (
          <span aria-hidden="true" className="px-1 text-slate-400" key={item}>
            ...
          </span>
        ) : (
          <PageLink
            aria-current={item === currentPage ? 'page' : undefined}
            key={item}
            page={item}
          >
            <span className="sr-only">Page </span>
            {item}
          </PageLink>
        ),
      )}

      {currentPage < totalPages ? (
        <PageLink page={currentPage + 1}>Next</PageLink>
      ) : null}
    </nav>
  )
}
