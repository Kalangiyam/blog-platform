import { Link } from 'react-router'

/**
 * Accessible breadcrumb navigation component.
 *
 * @param {{ items: Array<{ label: string, to?: string, isCurrent?: boolean }> }} props
 */
export default function ProfileBreadcrumbs({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.isCurrent

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 ? (
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}

              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-semibold text-slate-900 break-all"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  className="font-medium text-slate-600 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 rounded-xs"
                  to={item.to}
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
