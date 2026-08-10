import { useEffect, useState } from 'react'

import { useAuth } from '../../auth/hooks/useAuth.js'
import { getCurrentProfile, updateCurrentProfile } from '../api/profilesApi.js'
import ProfileAccountActionsCard from '../components/ProfileAccountActionsCard.jsx'
import ProfileBreadcrumbs from '../components/ProfileBreadcrumbs.jsx'
import ProfileCompletionCard from '../components/ProfileCompletionCard.jsx'
import ProfileEditForm from '../components/ProfileEditForm.jsx'
import ProfileHeaderCard from '../components/ProfileHeaderCard.jsx'
import ProfileRequestError from '../components/ProfileRequestError.jsx'
import ProfileSidebarNav from '../components/ProfileSidebarNav.jsx'
import ProfileSkeleton from '../components/ProfileSkeleton.jsx'
import ProfileUserInfoCard from '../components/ProfileUserInfoCard.jsx'
import { PROFILE_ERROR_CODES } from '../utils/normalizeProfileError.js'

export default function MyProfilePage() {
  const { user, hasAnyRole } = useAuth()
  const isAuthorOrEditor = hasAnyRole(['Author', 'Editor'])

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

  function handleStartEditing() {
    setSaveError(null)
    setIsEditing(true)
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
  const firstName = (user?.first_name || '').trim()
  const lastName = (user?.last_name || '').trim()
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || profile?.username || 'User'

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Profile', to: '/profile' },
    { label: displayName, isCurrent: true },
  ]

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <ProfileBreadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start">
        {/* Left Column (Desktop 3 cols) */}
        <div className="order-5 flex flex-col gap-6 lg:order-1 lg:col-span-3">
          <ProfileSidebarNav isAuthorOrEditor={isAuthorOrEditor} />

          <div className="hidden lg:block">
            <ProfileCompletionCard
              onEdit={handleStartEditing}
              profile={profile}
              user={user}
            />
          </div>
        </div>

        {/* Center Column (Desktop 6 cols) */}
        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:col-span-6">
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
            <ProfileHeaderCard
              isPrivate={true}
              onEdit={handleStartEditing}
              profile={profile}
              user={user}
            />
          )}
        </div>

        {/* Mobile Profile Completion Card (Order 2 on Mobile) */}
        <div className="order-2 lg:hidden">
          <ProfileCompletionCard
            onEdit={handleStartEditing}
            profile={profile}
            user={user}
          />
        </div>

        {/* Right Column (Desktop 3 cols, Mobile Orders 3 & 4) */}
        <div className="order-3 flex flex-col gap-6 lg:order-3 lg:col-span-3">
          <ProfileUserInfoCard
            isPrivate={true}
            profile={profile}
            user={user}
          />

          <div className="order-4 lg:order-none">
            <ProfileAccountActionsCard
              isAuthorOrEditor={isAuthorOrEditor}
              onEdit={handleStartEditing}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
