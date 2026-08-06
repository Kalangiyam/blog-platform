export default function CommentRequestError({ error, onRetry }) {
  const message =
    error?.message ||
    'An error occurred while loading comments. Please try again.'

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <div className="flex items-center justify-between gap-x-4">
        <p className="font-medium">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  )
}
