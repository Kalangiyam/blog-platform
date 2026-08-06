/**
 * Accessible skeleton loader component for profile pages.
 */
export default function ProfileSkeleton() {
  return (
    <section
      aria-label="Loading profile information..."
      aria-live="polite"
      className="w-full animate-pulse px-4 py-12 sm:px-6"
      role="status"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="h-24 w-24 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="h-4 w-32 rounded bg-slate-200" />
          </div>
        </div>

        <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
          <div className="h-4 w-full max-w-xl rounded bg-slate-200" />
          <div className="h-4 w-3/4 max-w-md rounded bg-slate-200" />
        </div>
      </div>
    </section>
  )
}
