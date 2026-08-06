import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { getPublicProfile } from '../api/profilesApi.js'
import ProfileDetails from '../components/ProfileDetails.jsx'
import ProfileRequestError from '../components/ProfileRequestError.jsx'
import ProfileSkeleton from '../components/ProfileSkeleton.jsx'
import { PROFILE_ERROR_CODES } from '../utils/normalizeProfileError.js'

export function PublicProfileNotFound() {
  return (
    <section className="grid w-full place-items-center px-6 py-16">
      <div className="max-w-xl text-center">
        <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase">404 Error</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">User Profile Not Found</h1>
        <p className="mt-4 leading-7 text-slate-600">The requested user profile does not exist or has been removed.</p>
        <Link
          className="mt-7 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState({
    requestKey: null,
    status: 'loading',
    profile: null,
    error: null,
  })

  const requestKey = `${username}:${retryKey}`
  const status = state.requestKey === requestKey ? state.status : 'loading'

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

  return (
    <section className="w-full px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          className="inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/posts"
        >
          ← Back to all posts
        </Link>

        <ProfileDetails isPrivate={false} profile={state.profile} />
      </div>
    </section>
  )
}
