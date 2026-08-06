import { PROFILE_ERROR_CODES } from '../utils/normalizeProfileError.js'

function getErrorMessage(error) {
  if (!error) {
    return 'An unexpected profile error occurred.'
  }

  if (error.code === PROFILE_ERROR_CODES.NOT_FOUND) {
    return 'The requested profile was not found.'
  }

  if (error.code === PROFILE_ERROR_CODES.UNAUTHENTICATED) {
    return 'You must be logged in to view or update this profile.'
  }

  if (error.code === PROFILE_ERROR_CODES.FORBIDDEN) {
    return 'You do not have permission to perform this action.'
  }

  if (error.code === PROFILE_ERROR_CODES.NETWORK_ERROR) {
    return 'Unable to connect to the profile service. Please check your internet connection.'
  }

  if (error.code === PROFILE_ERROR_CODES.SERVER_ERROR) {
    return 'The server encountered an issue loading the profile. Please try again.'
  }

  return error.message || 'An unexpected profile error occurred.'
}

/**
 * Accessible profile error component with retry support.
 *
 * @param {{ error: any, onRetry?: () => void }} props
 */
export default function ProfileRequestError({ error, onRetry }) {
  const isRetryable =
    error?.code === PROFILE_ERROR_CODES.NETWORK_ERROR ||
    error?.code === PROFILE_ERROR_CODES.SERVER_ERROR ||
    error?.code === PROFILE_ERROR_CODES.UNKNOWN_ERROR

  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-800"
      role="alert"
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-amber-900">
            Profile Loading Issue
          </h2>
          <p className="mt-1 text-sm text-amber-800">{getErrorMessage(error)}</p>
        </div>

        {isRetryable && typeof onRetry === 'function' ? (
          <button
            className="inline-flex shrink-0 rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
            onClick={onRetry}
            type="button"
          >
            Try Again
          </button>
        ) : null}
      </div>
    </div>
  )
}
