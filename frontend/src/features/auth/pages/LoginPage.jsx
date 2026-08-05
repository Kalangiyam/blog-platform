import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { AUTH_ERROR_CODES } from '../utils/authErrors.js'
import {
  getLoginErrorMessage,
  getLoginFieldErrors,
  validateLoginFields,
} from '../utils/loginForm.js'
import { safeReturnPathFromState } from '../utils/safeReturnPath.js'
import { useAuth } from '../hooks/useAuth.js'

const INITIAL_FIELDS = Object.freeze({
  email: '',
  password: '',
})

function getFieldDescriptionId(field, error) {
  return error ? `login-${field}-error` : undefined
}

export default function LoginPage() {
  const { authError, clearAuthError, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [fields, setFields] = useState(INITIAL_FIELDS)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMountedRef = useRef(false)
  const submissionInFlightRef = useRef(false)
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  function handleFieldChange(event) {
    const { name, value } = event.target

    setFields((currentFields) => ({
      ...currentFields,
      [name]: value,
    }))
    setFieldErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[name]
      return nextErrors
    })

    if (authError) {
      clearAuthError()
    }
  }

  function focusFirstInvalidField(errors) {
    if (errors.email) {
      emailInputRef.current?.focus()
    } else if (errors.password) {
      passwordInputRef.current?.focus()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (submissionInFlightRef.current) {
      return
    }

    const validationErrors = validateLoginFields(fields)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      clearAuthError()
      focusFirstInvalidField(validationErrors)
      return
    }

    submissionInFlightRef.current = true
    setIsSubmitting(true)
    setFieldErrors({})
    clearAuthError()

    try {
      await login({
        email: fields.email.trim(),
        password: fields.password,
      })

      if (isMountedRef.current) {
        setFields((currentFields) => ({
          ...currentFields,
          password: '',
        }))
      }

      navigate(safeReturnPathFromState(location.state), { replace: true })
    } catch (error) {
      const backendFieldErrors = getLoginFieldErrors(error)

      if (
        isMountedRef.current &&
        Object.keys(backendFieldErrors).length > 0
      ) {
        setFieldErrors(backendFieldErrors)
        focusFirstInvalidField(backendFieldErrors)
      } else if (
        isMountedRef.current &&
        (error?.code === AUTH_ERROR_CODES.INVALID_CREDENTIALS ||
          error?.code === AUTH_ERROR_CODES.UNAUTHORIZED)
      ) {
        setFields((currentFields) => ({
          ...currentFields,
          password: '',
        }))
        passwordInputRef.current?.focus()
      }
    } finally {
      submissionInFlightRef.current = false

      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  const formErrorMessage = getLoginErrorMessage(authError)

  return (
    <section className="grid w-full place-items-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sign in to your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use the email address and password assigned to your account.
          </p>
        </div>

        {formErrorMessage ? (
          <div
            aria-live="assertive"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            id="login-form-error"
            role="alert"
          >
            {formErrorMessage}
          </div>
        ) : null}

        <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-semibold text-slate-800"
              htmlFor="login-email"
            >
              Email address
            </label>
            <input
              aria-describedby={getFieldDescriptionId(
                'email',
                fieldErrors.email,
              )}
              aria-invalid={Boolean(fieldErrors.email)}
              autoCapitalize="none"
              autoComplete="email"
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              id="login-email"
              name="email"
              onChange={handleFieldChange}
              ref={emailInputRef}
              required
              spellCheck="false"
              type="email"
              value={fields.email}
            />
            {fieldErrors.email ? (
              <p
                className="mt-2 text-sm text-red-600"
                id="login-email-error"
              >
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-800"
              htmlFor="login-password"
            >
              Password
            </label>
            <input
              aria-describedby={getFieldDescriptionId(
                'password',
                fieldErrors.password,
              )}
              aria-invalid={Boolean(fieldErrors.password)}
              autoComplete="current-password"
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              id="login-password"
              name="password"
              onChange={handleFieldChange}
              ref={passwordInputRef}
              required
              type="password"
              value={fields.password}
            />
            {fieldErrors.password ? (
              <p
                className="mt-2 text-sm text-red-600"
                id="login-password-error"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <button
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link
            className="font-semibold text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/"
          >
            Return home
          </Link>
        </p>
      </div>
    </section>
  )
}
