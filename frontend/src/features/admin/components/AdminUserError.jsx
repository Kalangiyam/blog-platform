/**
 * Accessible error alert component with retry functionality for user administration pages.
 *
 * @param {Object} props
 * @param {string} [props.title='Error Loading User Data']
 * @param {string} props.message Error detail message
 * @param {Function} [props.onRetry] Callback for retrying action
 */
export default function AdminUserError({
  title = 'Error Loading User Data',
  message,
  onRetry,
}) {
  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-xs"
      role="alert"
    >
      <h3 className="text-lg font-bold text-red-900">{title}</h3>
      <p className="mt-2 text-sm text-red-800 max-w-md mx-auto">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <button
            className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            onClick={onRetry}
            type="button"
          >
            Try Again
          </button>
        </div>
      ) : null}
    </div>
  )
}
