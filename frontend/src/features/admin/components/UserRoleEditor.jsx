import { useState } from 'react'

import { APPLICATION_ROLES } from '../../permissions/index.js'

const MANAGED_ROLES = [
  APPLICATION_ROLES.AUTHOR,
  APPLICATION_ROLES.EDITOR,
  APPLICATION_ROLES.ADMINISTRATOR,
]

function areRolesEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false
  const set1 = new Set(arr1)
  return arr2.every((r) => set1.has(r))
}

/**
 * Role replacement editor component.
 * Clearly communicates replacement semantics and validates explicit role combinations.
 *
 * @param {Object} props
 * @param {Array<string>} props.currentRoles Initially assigned roles
 * @param {Function} props.onSave Callback returning Promise<void>
 * @param {boolean} [props.isSaving=false]
 * @param {Object} [props.error=null] Normalized error object
 * @param {string} [props.successMessage=null]
 */
export default function UserRoleEditor({
  currentRoles = [],
  onSave,
  isSaving = false,
  error = null,
  successMessage = null,
}) {
  const [selectedRoles, setSelectedRoles] = useState(currentRoles)
  const [prevRoles, setPrevRoles] = useState(currentRoles)

  if (prevRoles !== currentRoles) {
    setPrevRoles(currentRoles)
    setSelectedRoles(currentRoles)
  }

  const isDirty = !areRolesEqual(selectedRoles, currentRoles)

  function handleToggle(role) {
    setSelectedRoles((prev) => {
      const exists = prev.includes(role)
      return exists ? prev.filter((r) => r !== role) : [...prev, role]
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isDirty || isSaving) return
    await onSave(selectedRoles)
  }

  const roleErrorMessage = error?.fieldErrors?.roles
    ? Array.isArray(error.fieldErrors.roles)
      ? error.fieldErrors.roles.join(' ')
      : error.fieldErrors.roles
    : null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Application Role Replacement</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            <strong className="font-semibold text-slate-700">Notice:</strong> Saving replaces the user’s complete application-role collection with the selected roles below.
          </p>
        </div>
      </div>

      {successMessage ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"
          role="status"
        >
          {successMessage}
        </div>
      ) : null}

      {error?.message && !roleErrorMessage ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <fieldset className="space-y-2">
          <legend className="sr-only">Managed Application Roles</legend>
          {MANAGED_ROLES.map((role) => {
            const isChecked = selectedRoles.includes(role)
            return (
              <label
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer transition"
                key={role}
              >
                <input
                  checked={isChecked}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isSaving}
                  onChange={() => handleToggle(role)}
                  type="checkbox"
                />
                <span className="text-sm font-semibold text-slate-800">{role}</span>
              </label>
            )
          })}
        </fieldset>

        {roleErrorMessage ? (
          <p className="text-xs text-red-600 font-medium" role="alert">
            {roleErrorMessage}
          </p>
        ) : null}

        <div className="pt-2 flex items-center justify-end">
          <button
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            disabled={!isDirty || isSaving}
            type="submit"
          >
            {isSaving ? 'Replacing Roles…' : 'Save Role Replacement'}
          </button>
        </div>
      </form>
    </div>
  )
}
