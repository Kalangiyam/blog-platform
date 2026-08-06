import { useId, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { buildSearchPath, parseSearchQuery } from '../utils/searchParams.js'

function GlobalSearchForm({ className = '' }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlQuery = parseSearchQuery(searchParams)

  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)
  const [query, setQuery] = useState(urlQuery)
  const [validationError, setValidationError] = useState('')
  const inputId = useId()
  const errorId = useId()

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery)
    setQuery(urlQuery)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = query.trim()

    if (!trimmed) {
      setValidationError('Please enter a search query.')
      return
    }

    if (trimmed.length < 2) {
      setValidationError('Search query must be at least 2 characters.')
      return
    }

    if (trimmed.length > 100) {
      setValidationError('Search query cannot exceed 100 characters.')
      return
    }

    setValidationError('')
    const targetPath = buildSearchPath(trimmed, 1)
    navigate(targetPath)
  }

  const handleChange = (event) => {
    setQuery(event.target.value)
    if (validationError) {
      setValidationError('')
    }
  }

  return (
    <form
      aria-label="Global search"
      className={`relative flex items-center ${className}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="relative w-full min-w-[200px] sm:w-64 md:w-80">
        <label className="sr-only" htmlFor={inputId}>
          Search blog posts
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <input
          aria-describedby={validationError ? errorId : undefined}
          aria-invalid={Boolean(validationError)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pr-10 pl-9 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          id={inputId}
          name="q"
          onChange={handleChange}
          placeholder="Search blog posts..."
          type="search"
          value={query}
        />

        <button
          aria-label="Submit search"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          type="submit"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {validationError ? (
        <div
          aria-live="polite"
          className="absolute top-full left-0 mt-1.5 z-10 w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 shadow-md"
          id={errorId}
        >
          {validationError}
        </div>
      ) : null}
    </form>
  )
}

export default GlobalSearchForm
