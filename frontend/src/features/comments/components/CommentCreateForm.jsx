import { useState } from 'react'
import { Link, useLocation } from 'react-router'

import { useAuth } from '../../auth/hooks/useAuth.js'

const MAX_COMMENT_LENGTH = 2000

export default function CommentCreateForm({ onSubmitComment }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState(null)
  const [requestError, setRequestError] = useState(null)

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <h3 className="text-base font-semibold text-slate-900">
          Want to join the discussion?
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          You must be logged in to leave a comment.
        </p>
        <div className="mt-4">
          <Link
            to="/login"
            state={{ from: `${location.pathname}${location.search}` }}
            className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Log in to comment
          </Link>
        </div>
      </div>
    )
  }

  const remainingChars = MAX_COMMENT_LENGTH - content.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldError(null)
    setRequestError(null)

    const trimmed = content.trim()
    if (!trimmed) {
      setFieldError('Comment content cannot be empty.')
      return
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      setFieldError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmitComment({ content: trimmed })
      setContent('')
    } catch (err) {
      if (err?.fields?.content?.[0]) {
        setFieldError(err.fields.content[0])
      } else {
        setRequestError(
          err?.message || 'Failed to submit comment. Please try again.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="comment-content"
            className="block text-sm font-medium leading-6 text-slate-900"
          >
            Leave a comment
          </label>
          <span
            className={`text-xs ${
              remainingChars < 0
                ? 'font-semibold text-red-600'
                : 'text-slate-500'
            }`}
          >
            {remainingChars} characters remaining
          </span>
        </div>
        <div className="mt-2">
          <textarea
            id="comment-content"
            name="content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            placeholder="Share your thoughts..."
            className={`block w-full rounded-lg border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
              fieldError
                ? 'ring-red-300 focus:ring-red-500'
                : 'ring-slate-300 focus:ring-indigo-600'
            }`}
          />
        </div>
        {fieldError ? (
          <p id="comment-content-error" className="mt-1.5 text-xs text-red-600">
            {fieldError}
          </p>
        ) : null}
      </div>

      {requestError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {requestError}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
