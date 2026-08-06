import { Link } from 'react-router'

function SearchNoResults({ query }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
        No results found
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        We couldn&apos;t find any posts matching &ldquo;<span className="font-semibold text-slate-900">{query}</span>&rdquo;.
      </p>

      <div className="mt-6 flex justify-center gap-4">
        <Link
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/posts"
        >
          Browse All Posts
        </Link>
      </div>
    </div>
  )
}

export default SearchNoResults
