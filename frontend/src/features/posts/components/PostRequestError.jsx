import { POST_ERROR_CODES } from '../utils/postErrors.js'

const ERROR_COPY = Object.freeze({
  [POST_ERROR_CODES.NETWORK]: 'Unable to reach the server. Check your connection and try again.',
  [POST_ERROR_CODES.CLIENT]: 'The posts request could not be completed.',
  [POST_ERROR_CODES.SERVER]: 'The posts service is temporarily unavailable.',
})

function PostRequestError({ error, onRetry }) {
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
      <h2 className="text-xl font-bold text-red-900">Unable to load posts</h2>
      <p className="mt-2 text-red-800">
        {ERROR_COPY[error?.code] || 'Something went wrong while loading posts.'}
      </p>
      <button
        className="mt-5 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    </section>
  )
}

export default PostRequestError
