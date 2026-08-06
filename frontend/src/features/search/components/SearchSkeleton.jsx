function SearchSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading search results"
      className="space-y-6"
      role="status"
    >
      <span className="sr-only">Loading search results...</span>
      {[1, 2, 3].map((index) => (
        <div
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          key={index}
        >
          <div className="h-4 w-1/4 rounded bg-slate-200" />
          <div className="mt-4 h-7 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
          <div className="mt-6 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-200" />
            <div className="h-6 w-20 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default SearchSkeleton
