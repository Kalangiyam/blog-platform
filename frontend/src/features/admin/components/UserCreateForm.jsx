import { useState } from 'react'

import { APPLICATION_ROLES } from '../../permissions/index.js'
import { validateUserCreateData } from '../utils/adminUserValidation.js'

const AVAILABLE_ROLES = [
  APPLICATION_ROLES.AUTHOR,
  APPLICATION_ROLES.EDITOR,
  APPLICATION_ROLES.ADMINISTRATOR,
]

/**
 * Controlled user creation form for Administrators.
 * Maps field validation errors and guards against duplicate submissions.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit Callback returning Promise<void>
 * @param {boolean} [props.isSubmitting=false]
 * @param {Object} [props.error=null] Normalized error object
 */
export default function UserCreateForm({ onSubmit, isSubmitting = false, error = null }) {
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

  return (
    <form className="space-y-6 max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs" noValidate onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">
        Account Identity & Credentials
      </h2>

      {error?.message && (!error?.fieldErrors || Object.keys(error.fieldErrors).length === 0) ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            aria-invalid={Boolean(fieldErrors.username)}
            autoComplete="username"
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            disabled={isSubmitting}
            id="username"
            name="username"
            onChange={handleTextChange}
            required
            type="text"
            value={formData.username}
          />
          {fieldErrors.username ? (
            <p className="mt-1 text-xs text-red-600" id="username-error">
              {Array.isArray(fieldErrors.username) ? fieldErrors.username.join(' ') : fieldErrors.username}
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
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            disabled={isSubmitting}
            id="email"
            name="email"
            onChange={handleTextChange}
            required
            type="email"
            value={formData.email}
          />
          {fieldErrors.email ? (
            <p className="mt-1 text-xs text-red-600" id="email-error">
              {Array.isArray(fieldErrors.email) ? fieldErrors.email.join(' ') : fieldErrors.email}
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
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            disabled={isSubmitting}
            id="first_name"
            name="first_name"
            onChange={handleTextChange}
            type="text"
            value={formData.first_name}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="last_name">
            Last Name
          </label>
          <input
            autoComplete="family-name"
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            disabled={isSubmitting}
            id="last_name"
            name="last_name"
            onChange={handleTextChange}
            type="text"
            value={formData.last_name}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            aria-invalid={Boolean(fieldErrors.password)}
            autoComplete="new-password"
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            disabled={isSubmitting}
            id="password"
            name="password"
            onChange={handleTextChange}
            required
            type="password"
            value={formData.password}
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-red-600" id="password-error">
              {Array.isArray(fieldErrors.password) ? fieldErrors.password.join(' ') : fieldErrors.password}
            </p>
          ) : null}
        </div>

        {/* Password Confirm */}
        <div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="password_confirm">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            aria-describedby={fieldErrors.password_confirm ? 'password-confirm-error' : undefined}
            aria-invalid={Boolean(fieldErrors.password_confirm)}
            autoComplete="new-password"
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            disabled={isSubmitting}
            id="password_confirm"
            name="password_confirm"
            onChange={handleTextChange}
            required
            type="password"
            value={formData.password_confirm}
          />
          {fieldErrors.password_confirm ? (
            <p className="mt-1 text-xs text-red-600" id="password-confirm-error">
              {Array.isArray(fieldErrors.password_confirm)
                ? fieldErrors.password_confirm.join(' ')
                : fieldErrors.password_confirm}
            </p>
          ) : null}
        </div>
      </div>

      {/* Application Roles Selection */}
      <fieldset className="border-t border-slate-200 pt-6">
        <legend className="text-base font-bold text-slate-900">
          Initial Application Roles
        </legend>
        <p className="mt-1 text-xs text-slate-500">
          Select any explicit combination of application roles. Users may hold zero, one, or multiple roles.
        </p>

        <div className="mt-3 space-y-2">
          {AVAILABLE_ROLES.map((role) => {
            const isChecked = formData.roles.includes(role)
            return (
              <label
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer transition"
                key={role}
              >
                <input
                  checked={isChecked}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isSubmitting}
                  onChange={() => handleRoleToggle(role)}
                  type="checkbox"
                />
                <span className="text-sm font-semibold text-slate-800">{role}</span>
              </label>
            )
          })}
        </div>
        {fieldErrors.roles ? (
          <p className="mt-1.5 text-xs text-red-600">
            {Array.isArray(fieldErrors.roles) ? fieldErrors.roles.join(' ') : fieldErrors.roles}
          </p>
        ) : null}
      </fieldset>

      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
        <button
          className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating User…' : 'Create User Account'}
        </button>
      </div>
    </form>
  )
}
