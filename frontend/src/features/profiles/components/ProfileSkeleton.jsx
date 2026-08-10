/**
 * Accessible, layout-aware skeleton loader component for profile dashboard pages.
 */
export default function ProfileSkeleton() {
  return (
    <section
      aria-label="Loading profile information..."
      aria-live="polite"
      className="w-full animate-pulse px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6"
      role="status"
    >
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 rounded bg-slate-200" />

      {/* 3-Column Skeleton Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column Skeleton */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="h-44 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>

        {/* Center Column Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div className="h-24 w-24 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-3 w-full">
                <div className="h-7 w-48 rounded bg-slate-200" />
                <div className="h-4 w-28 rounded bg-slate-200" />
              </div>
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-5">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          <div className="h-56 rounded-2xl bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </section>
  )
}
