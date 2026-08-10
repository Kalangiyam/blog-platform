import { Link } from 'react-router'

/**
 * Right-side Account Quick Actions Card.
 * Rendered strictly for the current authenticated user on `/profile`.
 *
 * @param {{ isAuthorOrEditor?: boolean, onEdit?: () => void }} props
 */
export default function ProfileAccountActionsCard({ isAuthorOrEditor = false, onEdit }) {
  return (
    <section aria-label="Account Quick Actions" className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-sm font-bold tracking-wide text-slate-900 border-b border-slate-100 pb-3">
        Account Actions
      </h2>

      <div className="mt-4 space-y-2">
        {onEdit ? (
          <button
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={onEdit}
            type="button"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Edit Profile Details</span>
            </span>
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}

        <Link
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/account/security/password"
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Change Password</span>
          </span>
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {isAuthorOrEditor ? (
          <Link
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/dashboard/posts"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Editorial CMS Dashboard</span>
            </span>
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : null}
      </div>
    </section>
  )
}
