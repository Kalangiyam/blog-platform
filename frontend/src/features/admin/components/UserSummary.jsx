import UserRoleBadge from './UserRoleBadge.jsx'
import UserStatusBadge from './UserStatusBadge.jsx'

function formatDate(isoString) {
  if (!isoString) return 'Never'
  try {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

/**
 * Renders user account information summary.
 *
 * @param {Object} props
 * @param {Object} props.user
 */
export default function UserSummary({ user }) {
  const roles = Array.isArray(user.roles) ? user.roles : []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{user.username}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <UserStatusBadge isActive={user.is_active} />
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <div>
          <dt className="font-semibold text-slate-500">First Name</dt>
          <dd className="mt-1 text-slate-900">{user.first_name || 'N/A'}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Last Name</dt>
          <dd className="mt-1 text-slate-900">{user.last_name || 'N/A'}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Date Joined</dt>
          <dd className="mt-1 text-slate-900">{formatDate(user.date_joined)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Last Login</dt>
          <dd className="mt-1 text-slate-900">{formatDate(user.last_login)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-slate-500">Assigned Roles</dt>
          <dd aria-label="Assigned roles" className="mt-2 flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((role) => <UserRoleBadge key={role} role={role} />)
            ) : (
              <span className="text-xs text-slate-400 italic">No roles assigned</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  )
}
