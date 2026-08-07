import { Link } from 'react-router'

import AdminUserListItem from './AdminUserListItem.jsx'
import UserRoleBadge from './UserRoleBadge.jsx'
import UserStatusBadge from './UserStatusBadge.jsx'

function formatDate(isoString) {
  if (!isoString) return 'N/A'
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

/**
 * Renders user list with responsive desktop table and mobile card views.
 *
 * @param {Object} props
 * @param {Array<Object>} props.users
 */
export default function AdminUserList({ users }) {
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
        <h3 className="text-base font-semibold text-slate-900">No users found</h3>
        <p className="mt-1 text-sm text-slate-600">
          There are currently no platform users matching the query.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                scope="col"
              >
                Username
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                scope="col"
              >
                Email
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                scope="col"
              >
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                scope="col"
              >
                Application Roles
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                scope="col"
              >
                Date Joined
              </th>
              <th className="px-6 py-3 text-right" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <AdminUserListItem key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((user) => {
          const roles = Array.isArray(user.roles) ? user.roles : []

          return (
            <div
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              key={user.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    to={`/admin/users/${user.id}`}
                  >
                    {user.username}
                  </Link>
                  <p className="text-xs text-slate-500 break-all">{user.email}</p>
                </div>
                <UserStatusBadge isActive={user.is_active} />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Roles
                </span>
                <div aria-label="Assigned roles" className="mt-1 flex flex-wrap gap-1.5">
                  {roles.length > 0 ? (
                    roles.map((role) => <UserRoleBadge key={role} role={role} />)
                  ) : (
                    <span className="text-xs text-slate-400 italic">No roles</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Joined: {formatDate(user.date_joined)}
                </span>
                <Link
                  className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  to={`/admin/users/${user.id}`}
                >
                  Manage User
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
