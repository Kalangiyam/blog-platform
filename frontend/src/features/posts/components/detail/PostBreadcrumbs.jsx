import { Link } from 'react-router'

function PostBreadcrumbs({ category, title }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 overflow-hidden">
      <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <li>
          <Link
            className="transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/"
          >
            Home
          </Link>
        </li>
        {category ? (
          <>
            <li aria-hidden="true" className="text-slate-300">
              /
            </li>
            <li>
              <Link
                className="transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                to={`/?category=${encodeURIComponent(category.slug)}`}
              >
                {category.name}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden="true" className="text-slate-300">
          /
        </li>
        <li
          aria-current="page"
          className="max-w-[200px] truncate font-semibold text-slate-900 sm:max-w-xs md:max-w-md"
        >
          {title}
        </li>
      </ol>
    </nav>
  )
}

export default PostBreadcrumbs
