export default function UploadError({
  error,
  onRetry,
  onDismiss,
}) {
  if (!error) {
    return null
  }

  const errorMessage =
    typeof error === 'string'
      ? error
      : error.message || 'An unexpected error occurred during media operation.'

  const fieldErrorItems =
    error.fieldErrors && typeof error.fieldErrors === 'object'
      ? Object.entries(error.fieldErrors).flatMap(([field, msgs]) =>
          Array.isArray(msgs) ? msgs.map((m) => `${field}: ${m}`) : [`${field}: ${msgs}`],
        )
      : []

  return (
    <div
      aria-live="assertive"
      className="w-full rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-900 shadow-2xs"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>

        <div className="flex-1">
          <h4 className="font-semibold text-rose-900">Upload error</h4>
          <p className="mt-1 text-xs leading-relaxed text-rose-700">{errorMessage}</p>

          {fieldErrorItems.length > 0 && (
            <ul className="mt-2 list-disc pl-4 text-xs text-rose-700">
              {fieldErrorItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex gap-3 text-xs">
            {onRetry && (
              <button
                className="font-semibold text-rose-700 underline hover:text-rose-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                onClick={onRetry}
                type="button"
              >
                Try again
              </button>
            )}
            {onDismiss && (
              <button
                className="font-medium text-rose-600 hover:text-rose-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                onClick={onDismiss}
                type="button"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
