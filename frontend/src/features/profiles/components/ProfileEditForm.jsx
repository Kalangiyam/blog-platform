import { useState } from 'react'

import {
  PROFILE_FIELD_LIMITS,
  getChangedProfileFields,
  getTodayDateString,
  validateProfileForm,
} from '../utils/profileForm.js'

/**
 * Accessible form for editing authenticated user profile fields.
 *
 * @param {{
 *   initialProfile: { username?: string, email?: string, bio?: string, website?: string, location?: string, date_of_birth?: string|null },
 *   onSubmit: (patchPayload: Record<string, any>) => Promise<any>,
 *   onCancel?: () => void,
 *   serverError?: any,
 *   isSubmitting?: boolean
 * }} props
 */
export default function ProfileEditForm({
  initialProfile,
  onSubmit,
  onCancel,
  serverError = null,
  isSubmitting = false,
}) {
  const [formValues, setFormValues] = useState({
    bio: initialProfile?.bio ?? '',
    website: initialProfile?.website ?? '',
    location: initialProfile?.location ?? '',
    date_of_birth: initialProfile?.date_of_birth ?? '',
  })

  const [clientErrors, setClientErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState(null)

  const changedFields = getChangedProfileFields(formValues, initialProfile)
  const isDirty = Object.keys(changedFields).length > 0

  const fieldErrors = {
    ...clientErrors,
    ...(serverError?.fieldErrors || {}),
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))

    // Clear client error for edited field
    if (clientErrors[name]) {
      setClientErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    setSuccessMessage(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isDirty || isSubmitting) {
      return
    }

    const { isValid, errors } = validateProfileForm(formValues)

    if (!isValid) {
      setClientErrors(errors)
      return
    }

    setClientErrors({})
    setSuccessMessage(null)

    try {
      await onSubmit(changedFields)
      setSuccessMessage('Profile updated successfully.')
    } catch {
      // Server errors handled via props
    }
  }

  const todayDateStr = getTodayDateString()

  return (
    <form
      aria-label="Edit Profile"
      className="w-full space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Edit Profile</h2>
        <p className="text-sm text-slate-500">
          Update your public bio, website, location, and date of birth.
        </p>
      </div>

      {/* Identity Summary (Read-Only) */}
      <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Username</span>
          <p className="text-sm font-semibold text-slate-800">{initialProfile?.username}</p>
        </div>
        {initialProfile?.email ? (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
            <p className="text-sm font-semibold text-slate-800">{initialProfile.email}</p>
          </div>
        ) : null}
      </div>

      {/* Success Notification */}
      {successMessage ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
          role="status"
        >
          {successMessage}
        </div>
      ) : null}

      {/* Non-field server error */}
      {serverError?.message && !Object.keys(serverError?.fieldErrors || {}).length ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
          role="alert"
        >
          {serverError.message}
        </div>
      ) : null}

      {/* Bio Field */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="bio">
            Biography
          </label>
          <span className="text-xs text-slate-500">
            {formValues.bio.length} / {PROFILE_FIELD_LIMITS.BIO_MAX_LENGTH}
          </span>
        </div>
        <textarea
          aria-describedby={fieldErrors.bio ? 'bio-error' : undefined}
          aria-invalid={Boolean(fieldErrors.bio)}
          className={`w-full rounded-lg border p-3 text-sm text-slate-900 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-slate-100 ${
            fieldErrors.bio ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
          }`}
          disabled={isSubmitting}
          id="bio"
          maxLength={PROFILE_FIELD_LIMITS.BIO_MAX_LENGTH}
          name="bio"
          onChange={handleChange}
          rows={4}
          value={formValues.bio}
        />
        {fieldErrors.bio ? (
          <p className="text-xs font-medium text-red-600" id="bio-error">
            {Array.isArray(fieldErrors.bio) ? fieldErrors.bio.join(' ') : fieldErrors.bio}
          </p>
        ) : null}
      </div>

      {/* Location Field */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-800" htmlFor="location">
          Location
        </label>
        <input
          aria-describedby={fieldErrors.location ? 'location-error' : undefined}
          aria-invalid={Boolean(fieldErrors.location)}
          className={`w-full rounded-lg border p-3 text-sm text-slate-900 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-slate-100 ${
            fieldErrors.location ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
          }`}
          disabled={isSubmitting}
          id="location"
          maxLength={PROFILE_FIELD_LIMITS.LOCATION_MAX_LENGTH}
          name="location"
          onChange={handleChange}
          type="text"
          value={formValues.location}
        />
        {fieldErrors.location ? (
          <p className="text-xs font-medium text-red-600" id="location-error">
            {Array.isArray(fieldErrors.location) ? fieldErrors.location.join(' ') : fieldErrors.location}
          </p>
        ) : null}
      </div>

      {/* Website Field */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-800" htmlFor="website">
          Website URL
        </label>
        <input
          aria-describedby={fieldErrors.website ? 'website-error' : undefined}
          aria-invalid={Boolean(fieldErrors.website)}
          className={`w-full rounded-lg border p-3 text-sm text-slate-900 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-slate-100 ${
            fieldErrors.website ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
          }`}
          disabled={isSubmitting}
          id="website"
          name="website"
          onChange={handleChange}
          placeholder="https://example.com"
          type="url"
          value={formValues.website}
        />
        {fieldErrors.website ? (
          <p className="text-xs font-medium text-red-600" id="website-error">
            {Array.isArray(fieldErrors.website) ? fieldErrors.website.join(' ') : fieldErrors.website}
          </p>
        ) : null}
      </div>

      {/* Date of Birth Field */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-800" htmlFor="date_of_birth">
          Date of Birth
        </label>
        <input
          aria-describedby={fieldErrors.date_of_birth ? 'dob-error' : undefined}
          aria-invalid={Boolean(fieldErrors.date_of_birth)}
          className={`w-full rounded-lg border p-3 text-sm text-slate-900 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-slate-100 ${
            fieldErrors.date_of_birth ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
          }`}
          disabled={isSubmitting}
          id="date_of_birth"
          max={todayDateStr}
          name="date_of_birth"
          onChange={handleChange}
          type="date"
          value={formValues.date_of_birth}
        />
        {fieldErrors.date_of_birth ? (
          <p className="text-xs font-medium text-red-600" id="dob-error">
            {Array.isArray(fieldErrors.date_of_birth) ? fieldErrors.date_of_birth.join(' ') : fieldErrors.date_of_birth}
          </p>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
        {onCancel ? (
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}

        <button
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
          disabled={!isDirty || isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Saving changes…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
