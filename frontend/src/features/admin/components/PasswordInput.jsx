import { useState } from 'react'

/**
 * Reusable accessible password input field with independent show/hide visibility toggle.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {string} props.label
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} [props.placeholder='Enter password']
 * @param {string|string[]} [props.error=null]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.required=false]
 * @param {string} [props.autoComplete='new-password']
 */
export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter password',
  error = null,
  disabled = false,
  required = false,
  autoComplete = 'new-password',
}) {
  const [isVisible, setIsVisible] = useState(false)

  const hasError = Boolean(error)
  const errorMessage = Array.isArray(error) ? error.join(' ') : error

  function toggleVisibility() {
    setIsVisible((prev) => !prev)
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700" htmlFor={id}>
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>

      <div className="relative mt-1.5">
        <input
          aria-describedby={hasError ? `${id}-error` : undefined}
          aria-invalid={hasError}
          autoComplete={autoComplete}
          className={`block w-full rounded-xl border ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
          } px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
          disabled={disabled}
          id={id}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={isVisible ? 'text' : 'password'}
          value={value}
        />

        <button
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2 rounded-lg disabled:cursor-not-allowed"
          disabled={disabled}
          onClick={toggleVisibility}
          type="button"
        >
          {isVisible ? (
            /* Eye Off Icon */
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            /* Eye Icon */
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                d="M2.036 12c1.318 4.095 5.21 7 9.964 7s8.646-2.905 9.964-7c-1.318-4.095-5.21-7-9.964-7s-8.646 2.905-9.964 7Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {hasError ? (
        <p className="mt-1.5 text-xs font-medium text-red-600" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
