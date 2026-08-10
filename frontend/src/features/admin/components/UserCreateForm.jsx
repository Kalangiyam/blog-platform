import { useState } from 'react'
import { useNavigate } from 'react-router'

import AdminUserError from './AdminUserError.jsx'
import PasswordInput from './PasswordInput.jsx'
import PasswordStrengthIndicator from './PasswordStrengthIndicator.jsx'
import UserRoleSelector from './UserRoleSelector.jsx'
import { validateUserCreateData } from '../utils/adminUserValidation.js'

/**
 * Controlled user creation form for Administrators.
 * Composes presentational inputs, role selection cards, password strength indicator,
 * and handles form submit lifecycle and pre-flight validation.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit Callback returning Promise<void>
 * @param {boolean} [props.isSubmitting=false]
 * @param {Object} [props.error=null] Normalized error object
 */
export default function UserCreateForm({ onSubmit, isSubmitting = false, error = null }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    roles: [],
  })

  const [clientErrors, setClientErrors] = useState({})

  // Merge client-side validation errors with normalized backend field errors
  const fieldErrors = {
    ...clientErrors,
    ...(error?.fieldErrors || {}),
  }

  function handleTextChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (clientErrors[name]) {
      setClientErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  function handleRoleToggle(role) {
    setFormData((prev) => {
      const currentRoles = prev.roles
      const hasRole = currentRoles.includes(role)
      const nextRoles = hasRole
        ? currentRoles.filter((r) => r !== role)
        : [...currentRoles, role]

      return { ...prev, roles: nextRoles }
    })

    if (clientErrors.roles) {
      setClientErrors((prev) => {
        const next = { ...prev }
        delete next.roles
        return next
      })
    }
  }

  function handleCancel() {
    navigate('/admin/users')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isSubmitting) return

    const errors = validateUserCreateData(formData)
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors)
      return
    }

    setClientErrors({})
    await onSubmit({
      username: formData.username.trim(),
      email: formData.email.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      password: formData.password,
      password_confirm: formData.password_confirm,
      roles: formData.roles,
    })
  }

  const hasGeneralError = Boolean(
    error?.message &&
      (!error?.fieldErrors || Object.keys(error.fieldErrors).length === 0)
  )

  return (
    <form
      aria-busy={isSubmitting}
      className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
      noValidate
      onSubmit={handleSubmit}
    >
      {/* General Non-Field Error Banner */}
      {hasGeneralError ? (
        <AdminUserError message={error.message} title="Account Creation Failed" />
      ) : null}

      {/* Section 1: Account Identity & Credentials */}
      <div>
        <div className="flex items-start gap-3.5 mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {/* User Icon */}
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Account Identity & Credentials
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Basic identity information and login credentials for the new user.
            </p>
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
              aria-invalid={Boolean(fieldErrors.username)}
              autoComplete="username"
              className={`mt-1.5 block w-full rounded-xl border ${
                fieldErrors.username
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              } px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
              disabled={isSubmitting}
              id="username"
              name="username"
              onChange={handleTextChange}
              placeholder="Enter username"
              required
              type="text"
              value={formData.username}
            />
            {fieldErrors.username ? (
              <p className="mt-1.5 text-xs font-medium text-red-600" id="username-error">
                {Array.isArray(fieldErrors.username)
                  ? fieldErrors.username.join(' ')
                  : fieldErrors.username}
              </p>
            ) : null}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              className={`mt-1.5 block w-full rounded-xl border ${
                fieldErrors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              } px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
              disabled={isSubmitting}
              id="email"
              name="email"
              onChange={handleTextChange}
              placeholder="Enter email address"
              required
              type="email"
              value={formData.email}
            />
            {fieldErrors.email ? (
              <p className="mt-1.5 text-xs font-medium text-red-600" id="email-error">
                {Array.isArray(fieldErrors.email)
                  ? fieldErrors.email.join(' ')
                  : fieldErrors.email}
              </p>
            ) : null}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="first_name">
              First Name
            </label>
            <input
              autoComplete="given-name"
              className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              disabled={isSubmitting}
              id="first_name"
              name="first_name"
              onChange={handleTextChange}
              placeholder="Enter first name"
              type="text"
              value={formData.first_name}
            />
            {fieldErrors.first_name ? (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {Array.isArray(fieldErrors.first_name)
                  ? fieldErrors.first_name.join(' ')
                  : fieldErrors.first_name}
              </p>
            ) : null}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="last_name">
              Last Name
            </label>
            <input
              autoComplete="family-name"
              className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              disabled={isSubmitting}
              id="last_name"
              name="last_name"
              onChange={handleTextChange}
              placeholder="Enter last name"
              type="text"
              value={formData.last_name}
            />
            {fieldErrors.last_name ? (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {Array.isArray(fieldErrors.last_name)
                  ? fieldErrors.last_name.join(' ')
                  : fieldErrors.last_name}
              </p>
            ) : null}
          </div>

          {/* Password */}
          <PasswordInput
            autoComplete="new-password"
            disabled={isSubmitting}
            error={fieldErrors.password}
            id="password"
            label="Password"
            name="password"
            onChange={handleTextChange}
            placeholder="Enter password"
            required
            value={formData.password}
          />

          {/* Confirm Password */}
          <PasswordInput
            autoComplete="new-password"
            disabled={isSubmitting}
            error={fieldErrors.password_confirm}
            id="password_confirm"
            label="Confirm Password"
            name="password_confirm"
            onChange={handleTextChange}
            placeholder="Confirm password"
            required
            value={formData.password_confirm}
          />
        </div>

        {/* Password Strength Indicator */}
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      {/* Section 2: Initial Application Roles */}
      <UserRoleSelector
        disabled={isSubmitting}
        error={fieldErrors.roles}
        onRoleToggle={handleRoleToggle}
        selectedRoles={formData.roles}
      />

      {/* Form Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <button
          className="inline-flex items-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleCancel}
          type="button"
        >
          Cancel
        </button>

        <button
          className="inline-flex min-w-[11.5rem] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <>
              <svg
                aria-hidden="true"
                className="h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Creating User…</span>
            </>
          ) : (
            <>
              {/* User Plus Icon */}
              <svg
                aria-hidden="true"
                className="h-4.5 w-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M18 7.5v6m3-3h-6m-1.5-1.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Create User Account</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
