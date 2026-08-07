import { NavLink, Outlet } from 'react-router'
import { useAuthorization } from '../../permissions/hooks/useAuthorization.js'

export default function DashboardLayout() {
  const { isEditor, canManageCategories, canManageTags, canModerateComment } = useAuthorization()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Editorial CMS Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage blog posts, taxonomy categories and tags, and comment moderation.
        </p>
      </header>

      <div className="mb-6 border-b border-slate-200">
        <nav aria-label="Dashboard navigation" className="-mb-px flex flex-wrap gap-6">
          <NavLink
            className={({ isActive }) =>
              `inline-flex items-center border-b-2 py-3 px-1 text-sm font-semibold transition ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`
            }
            to="/dashboard/posts"
          >
            Posts
          </NavLink>

          {canManageCategories() ? (
            <NavLink
              className={({ isActive }) =>
                `inline-flex items-center border-b-2 py-3 px-1 text-sm font-semibold transition ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`
              }
              to="/dashboard/categories"
            >
              Categories
            </NavLink>
          ) : null}

          {canManageTags() ? (
            <NavLink
              className={({ isActive }) =>
                `inline-flex items-center border-b-2 py-3 px-1 text-sm font-semibold transition ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`
              }
              to="/dashboard/tags"
            >
              Tags
            </NavLink>
          ) : null}

          {canModerateComment() || isEditor ? (
            <NavLink
              className={({ isActive }) =>
                `inline-flex items-center border-b-2 py-3 px-1 text-sm font-semibold transition ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`
              }
              to="/dashboard/comments"
            >
              Comments Moderation
            </NavLink>
          ) : null}
        </nav>
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  )
}
