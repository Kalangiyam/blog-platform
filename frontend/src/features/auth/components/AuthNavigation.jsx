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

  return 'User'
}

function getInitials(user) {
  const name = getDisplayName(user)
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getLogoutWarning(error) {
  if (error?.code === AUTH_ERROR_CODES.STORAGE_UNAVAILABLE) {
    return 'You are signed out in this tab, but session removal could not be confirmed.'
  }

  return 'Signed out locally; server could not confirm session revocation.'
}

export default function AuthNavigation() {
  const { hasRole, logout, status, user } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutWarning, setLogoutWarning] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isMountedRef = useRef(false)
  const logoutInFlightRef = useRef(false)
  const menuRef = useRef(null)

  useEffect(() => {
    isMountedRef.current = true

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      isMountedRef.current = false
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  async function handleLogout() {
    if (logoutInFlightRef.current) {
      return
    }

    logoutInFlightRef.current = true
    setIsLoggingOut(true)
    setLogoutWarning(null)
    setIsMenuOpen(false)

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
        className="flex min-h-9 items-center gap-2"
        role="status"
      >
        <span className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    )
  }

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return (
      <div className="flex flex-col items-end gap-1">
        <nav aria-label="Account navigation">
          <Link
            aria-label="Login"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/login"
          >
            Sign In
          </Link>
        </nav>

        {logoutWarning ? (
          <p
            aria-live="polite"
            className="max-w-xs text-right text-[11px] leading-tight text-amber-700"
            role="status"
          >
            {logoutWarning}
          </p>
        ) : null}
      </div>
    )
  }

  const assignedRoles = ROLE_LIST.filter(hasRole)
  const isAuthorOrEditor = hasRole(APPLICATION_ROLES.AUTHOR) || hasRole(APPLICATION_ROLES.EDITOR)
  const isAdmin = hasRole(APPLICATION_ROLES.ADMINISTRATOR)

  return (
    <nav
      aria-label="Account navigation"
      className="relative flex items-center gap-2.5"
      ref={menuRef}
    >
      {/* Quick Primary CTA Button */}
      {isAuthorOrEditor ? (
        <Link
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/posts/new"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Create Post
        </Link>
      ) : null}

      {/* User Avatar Menu Trigger */}
      <button
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
        aria-label="User account menu"
        className="group flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white p-1.5 pr-2.5 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        type="button"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-xs font-bold text-white shadow-xs">
          {getInitials(user)}
        </div>

        <div className="hidden flex-col items-start text-left md:flex">
          <span className="text-xs font-bold text-slate-800 leading-tight">
            {getDisplayName(user)}
          </span>
          {assignedRoles.length > 0 ? (
            <span className="text-[10px] font-semibold text-indigo-600 leading-none mt-0.5">
              {assignedRoles[0]}
            </span>
          ) : null}
        </div>

        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isMenuOpen ? 'rotate-180 text-indigo-600' : 'group-hover:text-slate-600'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown Menu Card */}
      {isMenuOpen ? (
        <div
          aria-label="User account dropdown"
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5 z-50 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          {/* User Card Header */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-xs">
              {getInitials(user)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-bold text-slate-900">
                {getDisplayName(user)}
              </span>
              <span className="truncate text-xs text-slate-500 font-medium">
                @{user?.username || 'user'}
              </span>
              {assignedRoles.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {assignedRoles.map((r) => (
                    <span
                      className="rounded-md bg-indigo-100/80 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700"
                      key={r}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="my-1.5 border-t border-slate-100" />

          {/* Menu Navigation Links */}
          <div className="flex flex-col gap-0.5">
            {isAuthorOrEditor ? (
              <Link
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => setIsMenuOpen(false)}
                to="/dashboard"
              >
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Dashboard
              </Link>
            ) : null}


            {isAdmin ? (
              <Link
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => setIsMenuOpen(false)}
                to="/admin/users"
              >
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6 0 3.375 3.375 0 0 1 6 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                User Administration
              </Link>
            ) : null}

            <Link
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setIsMenuOpen(false)}
              to="/profile"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              My Profile
            </Link>

            <Link
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setIsMenuOpen(false)}
              to="/account/security/password"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Security
            </Link>
          </div>

          <div className="my-1.5 border-t border-slate-100" />

          {/* Logout Action */}
          <button
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50 cursor-pointer"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            <svg className="h-4 w-4 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isLoggingOut ? 'Signing out…' : 'Logout'}
          </button>
        </div>
      ) : null}
    </nav>
  )
}
