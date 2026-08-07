import { APPLICATION_ROLES } from '../../permissions/index.js'

function getRoleBadgeStyle(role) {
  switch (role) {
    case APPLICATION_ROLES.ADMINISTRATOR:
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case APPLICATION_ROLES.EDITOR:
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case APPLICATION_ROLES.AUTHOR:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

/**
 * Accessible badge component for displaying an application role.
 *
 * @param {Object} props
 * @param {string} props.role
 */
export default function UserRoleBadge({ role }) {
  const style = getRoleBadgeStyle(role)

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {role}
    </span>
  )
}
