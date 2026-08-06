function SearchEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
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
        Search Published Posts
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Enter a keyword or phrase in the search bar above to find blog posts.
      </p>
    </div>
  )
}

export default SearchEmptyState
