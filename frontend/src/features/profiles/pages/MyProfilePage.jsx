import { useEffect, useState } from 'react'

import { getCurrentProfile, updateCurrentProfile } from '../api/profilesApi.js'
import ProfileDetails from '../components/ProfileDetails.jsx'
import ProfileEditForm from '../components/ProfileEditForm.jsx'
import ProfileRequestError from '../components/ProfileRequestError.jsx'
import ProfileSkeleton from '../components/ProfileSkeleton.jsx'
import { PROFILE_ERROR_CODES } from '../utils/normalizeProfileError.js'

export default function MyProfilePage() {
  const [retryKey, setRetryKey] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const [state, setState] = useState({
    requestKey: null,
    status: 'loading',
    profile: null,
    error: null,
  })

  const requestKey = `my-profile:${retryKey}`
  const status = state.requestKey === requestKey ? state.status : 'loading'

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadProfile() {
      try {
        const profile = await getCurrentProfile({ signal: controller.signal })
        if (active) {
          setState({
            requestKey,
            status: 'success',
            profile,
            error: null,
          })
        }
      } catch (error) {
        if (active && error.code !== PROFILE_ERROR_CODES.CANCELLED) {
          setState({
            requestKey,
            status: 'error',
            profile: null,
            error,
          })
        }
      }
    }

    loadProfile()

    return () => {
      active = false
      controller.abort()
    }
  }, [requestKey])

  async function handleUpdateProfile(patchPayload) {
    setIsSubmitting(true)
    setSaveError(null)

    try {
      const updatedProfile = await updateCurrentProfile(patchPayload)
      setState((prev) => ({
        ...prev,
        profile: updatedProfile,
      }))
      setIsEditing(false)
      return updatedProfile
    } catch (error) {
      setSaveError(error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return <ProfileSkeleton />
  }

  if (status === 'error') {
    return (
      <section className="w-full px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <ProfileRequestError
            error={state.error}
            onRetry={() => setRetryKey((k) => k + 1)}
          />
        </div>
      </section>
    )
  }

  const profile = state.profile

  return (
    <section className="w-full px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Profile
            </h1>
            <p className="text-sm text-slate-500">
              Manage your personal account profile and public representation.
            </p>
          </div>

          {!isEditing ? (
            <button
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                setSaveError(null)
                setIsEditing(true)
              }}
              type="button"
            >
              Edit Profile
            </button>
          ) : null}
        </header>

        {isEditing ? (
          <ProfileEditForm
            initialProfile={profile}
            isSubmitting={isSubmitting}
            onCancel={() => {
              setSaveError(null)
              setIsEditing(false)
            }}
            onSubmit={handleUpdateProfile}
            serverError={saveError}
          />
        ) : (
          <ProfileDetails isPrivate={true} profile={profile} />
        )}
      </div>
    </section>
  )
}
