import { SEARCH_ERROR_CODES } from '../utils/searchErrors.js'

function SearchRequestError({ error, onRetry }) {
  let title = 'Unable to complete search'
  let message = 'An unexpected error occurred while searching. Please try again.'

  if (error?.code === SEARCH_ERROR_CODES.NETWORK) {
    title = 'Network error'
    message = 'Could not connect to the server. Please check your internet connection and try again.'
  } else if (error?.code === SEARCH_ERROR_CODES.INVALID_QUERY) {
    title = 'Invalid search query'
    message = Array.isArray(error.detail) ? error.detail.join(' ') : 'Please enter a valid query.'
  } else if (error?.code === SEARCH_ERROR_CODES.INVALID_PAGE) {
    title = 'Page not found'
    message = 'The requested search results page does not exist.'
  } else if (error?.code === SEARCH_ERROR_CODES.SERVER) {
    title = 'Server error'
    message = 'The server encountered an error processing your search request. Please try again later.'
  }

  return (
    <div
      aria-live="assertive"
      className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-xs"
      role="alert"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="mt-4 text-lg font-bold text-rose-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-rose-700">{message}</p>

      {onRetry ? (
        <button
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          onClick={onRetry}
          type="button"
        >
          Try Again
        </button>
      ) : null}
    </div>
  )
}

export default SearchRequestError
