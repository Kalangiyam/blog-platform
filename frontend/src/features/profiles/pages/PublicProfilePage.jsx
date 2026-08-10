import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { useAuth } from '../../auth/hooks/useAuth.js'
import { getPublicProfile } from '../api/profilesApi.js'
import ProfileBreadcrumbs from '../components/ProfileBreadcrumbs.jsx'
import ProfileHeaderCard from '../components/ProfileHeaderCard.jsx'
import ProfileRequestError from '../components/ProfileRequestError.jsx'
import ProfileSkeleton from '../components/ProfileSkeleton.jsx'
import ProfileUserInfoCard from '../components/ProfileUserInfoCard.jsx'
import { PROFILE_ERROR_CODES } from '../utils/normalizeProfileError.js'

export function PublicProfileNotFound() {
  return (
    <section className="grid w-full place-items-center px-6 py-16">
      <div className="max-w-xl text-center">
        <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase">404 Error</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">User Profile Not Found</h1>
        <p className="mt-4 leading-7 text-slate-600">The requested user profile does not exist or has been removed.</p>
        <Link
          className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 shadow-xs"
          to="/posts"
        >
          Browse posts
        </Link>
      </div>
    </section>
  )
}

export default function PublicProfilePage() {
  const { username } = useParams()
  const { user: authUser } = useAuth()
  const [retryKey, setRetryKey] = useState(0)

  const [state, setState] = useState({
    requestKey: null,
    status: 'loading',
    profile: null,
    error: null,
  })

  const requestKey = `${username}:${retryKey}`
  const status = state.requestKey === requestKey ? state.status : 'loading'

  // Determine if viewing user is the profile owner
  const isOwner = Boolean(
    authUser?.username &&
    username &&
    authUser.username.toLowerCase() === username.toLowerCase()
  )

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function fetchProfile() {
      try {
        const profile = await getPublicProfile(username, {
          signal: controller.signal,
        })

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

    fetchProfile()

    return () => {
      active = false
      controller.abort()
    }
  }, [username, requestKey])

  if (status === 'loading') {
    return <ProfileSkeleton />
  }

  if (status === 'error' && state.error?.code === PROFILE_ERROR_CODES.NOT_FOUND) {
    return <PublicProfileNotFound />
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

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Posts', to: '/posts' },
    { label: `@${profile.username}`, isCurrent: true },
  ]

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <ProfileBreadcrumbs items={breadcrumbItems} />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start">
        {/* Main Profile Header & Overview */}
        <div className="lg:col-span-8 space-y-6">
          <ProfileHeaderCard
            isPrivate={false}
            profile={profile}
          />
        </div>

        {/* Right Information Column */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileUserInfoCard
            isPrivate={false}
            profile={profile}
          />

          {isOwner ? (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 text-center">
              <p className="text-xs text-indigo-950">
                You are viewing your public author profile.
              </p>
              <Link
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                to="/profile"
              >
                Manage My Private Profile
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
