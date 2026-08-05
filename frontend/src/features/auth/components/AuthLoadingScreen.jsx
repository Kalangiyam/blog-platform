export default function AuthLoadingScreen() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="grid min-h-80 w-full place-items-center px-6 py-16"
      role="status"
    >
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
        />
        Checking your session…
      </div>
    </section>
  )
}
