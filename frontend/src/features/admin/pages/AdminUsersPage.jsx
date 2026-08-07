import { Link, useSearchParams } from 'react-router'

import AdminPagination from '../components/AdminPagination.jsx'
import AdminUserError from '../components/AdminUserError.jsx'
import AdminUserList from '../components/AdminUserList.jsx'
import { useAdminUsers } from '../hooks/useAdminUsers.js'

function parsePageParam(searchParams) {
  const pageRaw = searchParams.get('page')
  const pageNum = parseInt(pageRaw, 10)
  return Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1
}

export default function AdminUsersPage() {
  const [searchParams] = useSearchParams()
  const currentPage = parsePageParam(searchParams)

  const { users, count, isLoading, error, refetch } = useAdminUsers(currentPage)

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header section */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              User Administration
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Manage platform user accounts, active status, and application roles.
            </p>
          </div>

          <Link
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/admin/users/new"
          >
            Create New User
          </Link>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div aria-label="Loading users" className="space-y-4 py-8" role="status">
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
            <div className="h-16 w-full animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
          </div>
        ) : error ? (
          <AdminUserError message={error.message} onRetry={refetch} />
        ) : (
          <>
            <AdminUserList users={users} />
            <AdminPagination count={count} currentPage={currentPage} />
          </>
        )}
      </div>
    </div>
  )
}
