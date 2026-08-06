/**
 * Accessible inline message callout for authorization notifications.
 *
 * @param {Object} props
 * @param {string} props.message - User facing message explaining the authorization restriction
 * @param {'warning'|'error'|'info'} [props.variant='warning']
 */
export default function AuthorizationMessage({ message, variant = 'warning' }) {
  if (!message) return null

  const colorStyles = {
    warning: 'bg-amber-50 border-amber-300 text-amber-900',
    error: 'bg-red-50 border-red-300 text-red-900',
    info: 'bg-blue-50 border-blue-300 text-blue-900',
  }[variant] || 'bg-amber-50 border-amber-300 text-amber-900'

  return (
    <div
      aria-live="polite"
      className={`rounded-md border p-3 text-sm font-medium ${colorStyles}`}
      role="status"
    >
      <p>{message}</p>
    </div>
  )
}
