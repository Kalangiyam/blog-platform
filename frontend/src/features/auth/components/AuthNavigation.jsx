import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { AUTH_STATUS } from '../context/AuthContext.js'
import { useAuth } from '../hooks/useAuth.js'
import { AUTH_ERROR_CODES } from '../utils/authErrors.js'
import { APPLICATION_ROLES } from '../../permissions/index.js'

const ROLE_LIST = Object.values(APPLICATION_ROLES)

function getDisplayName(user) {
  if (typeof user?.first_name === 'string' && user.first_name.trim()) {
    return user.first_name.trim()
  }

  if (typeof user?.username === 'string' && user.username.trim()) {
    return user.username.trim()
  }

  return 'Signed-in user'
}

function getLogoutWarning(error) {
  if (error?.code === AUTH_ERROR_CODES.STORAGE_UNAVAILABLE) {
    return 'You are signed out in this tab, but the browser could not confirm removal of the stored session.'
  }

  return 'You are signed out locally, but the server could not confirm session revocation.'
}

export default function AuthNavigation() {
  const { hasRole, logout, status, user } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutWarning, setLogoutWarning] = useState(null)
  const isMountedRef = useRef(false)
  const logoutInFlightRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  async function handleLogout() {
    if (logoutInFlightRef.current) {
      return
    }

    logoutInFlightRef.current = true
    setIsLoggingOut(true)
    setLogoutWarning(null)

    const logoutPromise = logout()
    navigate('/', { replace: true })

    try {
      await logoutPromise
    } catch (error) {
      if (isMountedRef.current) {
        setLogoutWarning(getLogoutWarning(error))
      }
    } finally {
      logoutInFlightRef.current = false

      if (isMountedRef.current) {
        setIsLoggingOut(false)
      }
    }
  }

  if (status === AUTH_STATUS.CHECKING) {
    return (
      <div
        aria-label="Account navigation is loading"
        className="flex min-h-9 items-center"
        role="status"
      >
        <span
          aria-hidden="true"
          className="h-4 w-24 animate-pulse rounded bg-slate-200 motion-reduce:animate-none"
        />
      </div>
    )
  }

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return (
      <div className="flex flex-col items-end gap-2">
        <nav aria-label="Account navigation">
          <Link
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/login"
          >
            Login
          </Link>
        </nav>

        {logoutWarning ? (
          <p
            aria-live="polite"
            className="max-w-sm text-right text-xs leading-5 text-amber-700"
            role="status"
          >
            {logoutWarning}
          </p>
        ) : null}
      </div>
    )
  }

  const assignedRoles = ROLE_LIST.filter(hasRole)

  return (
    <nav
      aria-label="Account navigation"
      className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2"
    >
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Link
          className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/profile"
        >
          {getDisplayName(user)}
        </Link>
        {assignedRoles.map((role) => (
          <span
            className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
            key={role}
          >
            {role}
          </span>
        ))}
      </div>

      {hasRole(APPLICATION_ROLES.AUTHOR) || hasRole(APPLICATION_ROLES.EDITOR) ? (
        <Link
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/dashboard"
        >
          Dashboard
        </Link>
      ) : null}

      {hasRole(APPLICATION_ROLES.AUTHOR) || hasRole(APPLICATION_ROLES.EDITOR) ? (
        <Link
          className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 hover:text-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          to="/posts/new"
        >
          Create Post
        </Link>
      ) : null}

      {hasRole(APPLICATION_ROLES.ADMINISTRATOR) ? (
        <Link
          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/admin/users"
        >
          User Administration
        </Link>
      ) : null}

      <Link
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        to="/account/security/password"
      >
        Security
      </Link>

      <Link
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        to="/profile"
      >
        My Profile
      </Link>

      <button
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
        disabled={isLoggingOut}
        onClick={handleLogout}
        type="button"
      >
        {isLoggingOut ? 'Signing out…' : 'Logout'}
      </button>
    </nav>
  )
}
