import { Link } from 'react-router'

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
 * Renders a single user row/card for the Administrator user list.
 *
 * @param {Object} props
 * @param {Object} props.user
 * @param {number|string} props.user.id
 * @param {string} props.user.username
 * @param {string} props.user.email
 * @param {boolean} props.user.is_active
 * @param {Array<string>} [props.user.roles]
 * @param {string} [props.user.date_joined]
 */
export default function AdminUserListItem({ user }) {
  const roles = Array.isArray(user.roles) ? user.roles : []

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
        <Link
          className="text-indigo-600 hover:underline hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to={`/admin/users/${user.id}`}
        >
          {user.username}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
        {user.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <UserStatusBadge isActive={user.is_active} />
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        <div aria-label="Assigned roles" className="flex flex-wrap gap-1.5">
          {roles.length > 0 ? (
            roles.map((role) => <UserRoleBadge key={role} role={role} />)
          ) : (
            <span className="text-xs text-slate-400 italic">No roles assigned</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
        {formatDate(user.date_joined)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          className="inline-flex rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs ring-1 ring-slate-300 ring-inset hover:bg-indigo-50 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to={`/admin/users/${user.id}`}
        >
          Manage <span className="sr-only">user {user.username}</span>
        </Link>
      </td>
    </tr>
  )
}
