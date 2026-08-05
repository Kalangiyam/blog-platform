import {
  createRef,
  forwardRef,
  StrictMode,
  useEffect,
  useImperativeHandle,
} from 'react'
import {
  act,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authApiMocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
}))

const tokenStorageMocks = vi.hoisted(() => ({
  clearAccessToken: vi.fn(),
  clearAuthTokens: vi.fn(),
  getRefreshToken: vi.fn(),
}))

const sessionInvalidationMocks = vi.hoisted(() => ({
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}))

vi.mock('../api/authApi.js', () => authApiMocks)
vi.mock('../storage/tokenStorage.js', () => tokenStorageMocks)
vi.mock('../events/sessionInvalidation.js', () => ({
  subscribeToSessionInvalidation: sessionInvalidationMocks.subscribe,
}))

import AuthProvider from './AuthProvider.jsx'
import { AUTH_STATUS } from './AuthContext.js'
import { useAuth } from '../hooks/useAuth.js'
import {
  AUTH_ERROR_CODES,
  createAuthError,
} from '../utils/authErrors.js'

const AuthProbe = forwardRef(function AuthProbe(
  { onSnapshot = null },
  ref,
) {
  const auth = useAuth()

  useImperativeHandle(ref, () => auth, [auth])

  useEffect(() => {
    onSnapshot?.({
      authError: auth.authError,
      status: auth.status,
      user: auth.user,
    })
  }, [auth.authError, auth.status, auth.user, onSnapshot])

  return (
    <section>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="user">{JSON.stringify(auth.user)}</span>
      <span data-testid="error">{auth.authError?.code ?? ''}</span>
    </section>
  )
})

function createDeferred() {
  let resolve
  let reject

  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, reject, resolve }
}

function renderAuthProvider({ onSnapshot, strict = false } = {}) {
  const authRef = createRef()
  const provider = (
    <AuthProvider>
      <AuthProbe ref={authRef} onSnapshot={onSnapshot} />
    </AuthProvider>
  )
  const result = render(
    strict ? <StrictMode>{provider}</StrictMode> : provider,
  )

  return { authRef, ...result }
}

async function waitForStatus(status) {
  await waitFor(() => {
    expect(screen.getByTestId('status')).toHaveTextContent(status)
  })
}

async function renderAuthenticated(user, options) {
  tokenStorageMocks.getRefreshToken.mockReturnValue('refresh-token')
  authApiMocks.refreshSession.mockResolvedValue('access-token')
  authApiMocks.getCurrentUser.mockResolvedValue(user)

  const rendered = renderAuthProvider(options)
  await waitForStatus(AUTH_STATUS.AUTHENTICATED)

  return rendered
}

beforeEach(() => {
  for (const mock of Object.values(authApiMocks)) {
    mock.mockReset()
  }

  for (const mock of Object.values(tokenStorageMocks)) {
    mock.mockReset()
  }

  for (const mock of Object.values(sessionInvalidationMocks)) {
    mock.mockReset()
  }

  tokenStorageMocks.getRefreshToken.mockReturnValue(null)
  tokenStorageMocks.clearAuthTokens.mockReturnValue(true)
  sessionInvalidationMocks.subscribe.mockReturnValue(
    sessionInvalidationMocks.unsubscribe,
  )
})

describe('AuthProvider session restoration', () => {
  it('keeps checking until refresh and current-user restoration complete', async () => {
    const refreshDeferred = createDeferred()
    const currentUser = {
      id: 1,
      username: 'restored_user',
      roles: ['Author', 'Editor'],
    }

    tokenStorageMocks.getRefreshToken.mockReturnValue('refresh-token')
    authApiMocks.refreshSession.mockReturnValue(refreshDeferred.promise)
    authApiMocks.getCurrentUser.mockResolvedValue(currentUser)

    const { authRef } = renderAuthProvider()

    expect(screen.getByTestId('status')).toHaveTextContent(
      AUTH_STATUS.CHECKING,
    )
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('null')

    await act(async () => {
      refreshDeferred.resolve('access-token')
      await refreshDeferred.promise
    })

    await waitForStatus(AUTH_STATUS.AUTHENTICATED)
    expect(authRef.current.user).toEqual(currentUser)
    expect(authRef.current.authError).toBeNull()
    expect(authApiMocks.refreshSession).toHaveBeenCalledTimes(1)
    expect(authApiMocks.getCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('settles unauthenticated without requests when no refresh token exists', async () => {
    const { authRef } = renderAuthProvider()

    await waitForStatus(AUTH_STATUS.UNAUTHENTICATED)

    expect(authRef.current.user).toBeNull()
    expect(authRef.current.authError).toBeNull()
    expect(authApiMocks.refreshSession).not.toHaveBeenCalled()
    expect(authApiMocks.getCurrentUser).not.toHaveBeenCalled()
  })

  it('surfaces an invalid restored session and clears definitive credentials', async () => {
    const authError = createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)

    tokenStorageMocks.getRefreshToken.mockReturnValue('invalid-refresh')
    authApiMocks.refreshSession.mockRejectedValue(authError)

    const { authRef } = renderAuthProvider()
    await waitForStatus(AUTH_STATUS.UNAUTHENTICATED)

    expect(authRef.current.authError).toBe(authError)
    expect(screen.getByTestId('error')).toHaveTextContent(
      AUTH_ERROR_CODES.UNAUTHORIZED,
    )
    expect(tokenStorageMocks.clearAccessToken).toHaveBeenCalledTimes(1)
    expect(tokenStorageMocks.clearAuthTokens).toHaveBeenCalledTimes(1)
  })

  it('exits checking but preserves refresh credentials after a temporary failure', async () => {
    const authError = createAuthError(AUTH_ERROR_CODES.NETWORK)

    tokenStorageMocks.getRefreshToken.mockReturnValue('valid-refresh')
    authApiMocks.refreshSession.mockRejectedValue(authError)

    const { authRef } = renderAuthProvider()
    await waitForStatus(AUTH_STATUS.UNAUTHENTICATED)

    expect(authRef.current.authError).toBe(authError)
    expect(tokenStorageMocks.clearAccessToken).toHaveBeenCalledTimes(1)
    expect(tokenStorageMocks.clearAuthTokens).not.toHaveBeenCalled()
  })
})

describe('AuthProvider login', () => {
  it('uses /me as the authoritative user and exposes no token values', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'not-rendered',
    }
    const currentUser = {
      id: 11,
      username: 'current_user',
      email: 'user@example.com',
      first_name: 'Current',
      last_name: 'User',
      roles: ['Editor'],
    }
    const nestedLoginUser = {
      id: 99,
      username: 'non_authoritative',
      access: 'access-secret',
      refresh: 'refresh-secret',
    }

    const { authRef } = renderAuthProvider()
    await waitForStatus(AUTH_STATUS.UNAUTHENTICATED)

    authApiMocks.login.mockResolvedValue(nestedLoginUser)
    authApiMocks.getCurrentUser.mockResolvedValue(currentUser)

    let returnedUser

    await act(async () => {
      returnedUser = await authRef.current.login(credentials)
    })

    expect(authApiMocks.login).toHaveBeenCalledWith(credentials)
    expect(authApiMocks.getCurrentUser).toHaveBeenCalledTimes(1)
    expect(returnedUser).toBe(currentUser)
    expect(authRef.current.user).toBe(currentUser)
    expect(authRef.current.status).toBe(AUTH_STATUS.AUTHENTICATED)
    expect(Object.keys(authRef.current).sort()).toEqual([
      'authError',
      'clearAuthError',
      'hasAnyRole',
      'hasRole',
      'isAuthenticated',
      'login',
      'logout',
      'status',
      'user',
    ])
    expect(screen.queryByText(/access-secret|refresh-secret/)).toBeNull()
    expect(JSON.stringify(authRef.current)).not.toContain('access-secret')
    expect(JSON.stringify(authRef.current)).not.toContain('refresh-secret')
  })

  it('rejects a login failure and clears authentication state', async () => {
    const authError = createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS)
    const { authRef } = renderAuthProvider()

    await waitForStatus(AUTH_STATUS.UNAUTHENTICATED)
    authApiMocks.login.mockRejectedValue(authError)

    let rejectedError

    await act(async () => {
      try {
        await authRef.current.login({
          email: 'user@example.com',
          password: 'wrong-password',
        })
      } catch (error) {
        rejectedError = error
      }
    })

    expect(rejectedError).toBe(authError)
    expect(authApiMocks.getCurrentUser).not.toHaveBeenCalled()
    expect(tokenStorageMocks.clearAuthTokens).toHaveBeenCalledTimes(1)
    expect(authRef.current.user).toBeNull()
    expect(authRef.current.authError).toBe(authError)
  })

  it('rejects a post-login /me failure instead of trusting login user data', async () => {
    const authError = createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)
    const { authRef } = renderAuthProvider()

    await waitForStatus(AUTH_STATUS.UNAUTHENTICATED)
    authApiMocks.login.mockResolvedValue({
      id: 55,
      username: 'login_user',
    })
    authApiMocks.getCurrentUser.mockRejectedValue(authError)

    let rejectedError

    await act(async () => {
      try {
        await authRef.current.login({
          email: 'user@example.com',
          password: 'password',
        })
      } catch (error) {
        rejectedError = error
      }
    })

    expect(rejectedError).toBe(authError)
    expect(tokenStorageMocks.clearAuthTokens).toHaveBeenCalledTimes(1)
    expect(authRef.current.status).toBe(AUTH_STATUS.UNAUTHENTICATED)
    expect(authRef.current.user).toBeNull()
    expect(authRef.current.authError).toBe(authError)
  })
})

describe('AuthProvider logout', () => {
  const authenticatedUser = {
    id: 21,
    username: 'logout_user',
    roles: ['Author'],
  }

  it('clears Context state before a successful backend logout settles', async () => {
    const logoutDeferred = createDeferred()
    const { authRef } = await renderAuthenticated(authenticatedUser)

    authApiMocks.logout.mockReturnValue(logoutDeferred.promise)

    let logoutPromise
    act(() => {
      logoutPromise = authRef.current.logout()
    })

    await waitForStatus(AUTH_STATUS.UNAUTHENTICATED)
    expect(authRef.current.user).toBeNull()
    expect(authApiMocks.logout).toHaveBeenCalledTimes(1)

    await act(async () => {
      logoutDeferred.resolve('Successfully logged out.')
      await logoutPromise
    })

    expect(tokenStorageMocks.clearAuthTokens).toHaveBeenCalledTimes(1)
    expect(authRef.current.authError).toBeNull()
  })

  it('keeps local state unauthenticated and exposes a safe backend failure', async () => {
    const authError = createAuthError(AUTH_ERROR_CODES.NETWORK)
    const { authRef } = await renderAuthenticated(authenticatedUser)

    authApiMocks.logout.mockRejectedValue(authError)

    let rejectedError

    await act(async () => {
      try {
        await authRef.current.logout()
      } catch (error) {
        rejectedError = error
      }
    })

    expect(rejectedError).toBe(authError)
    expect(authRef.current.status).toBe(AUTH_STATUS.UNAUTHENTICATED)
    expect(authRef.current.user).toBeNull()
    expect(authRef.current.authError).toBe(authError)
    expect(tokenStorageMocks.clearAuthTokens).toHaveBeenCalledTimes(1)
  })

  it('shares repeated in-flight logout calls and skips the API without a session', async () => {
    const logoutDeferred = createDeferred()
    const { authRef } = await renderAuthenticated(authenticatedUser)

    authApiMocks.logout.mockReturnValue(logoutDeferred.promise)

    let firstLogout
    let secondLogout

    act(() => {
      firstLogout = authRef.current.logout()
      secondLogout = authRef.current.logout()
    })

    expect(secondLogout).toBe(firstLogout)
    await waitFor(() => {
      expect(authApiMocks.logout).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      logoutDeferred.resolve('Successfully logged out.')
      await firstLogout
    })

    tokenStorageMocks.getRefreshToken.mockReturnValue(null)

    let repeatedResult
    await act(async () => {
      repeatedResult = await authRef.current.logout()
    })

    expect(repeatedResult).toBeUndefined()
    expect(authApiMocks.logout).toHaveBeenCalledTimes(1)
    expect(authRef.current.status).toBe(AUTH_STATUS.UNAUTHENTICATED)
  })
})

describe('AuthProvider roles and lifecycle', () => {
  it('treats roles independently and supports any-role checks', async () => {
    const { authRef } = await renderAuthenticated({
      id: 31,
      username: 'multi_role',
      roles: ['Author', 'Administrator'],
    })

    expect(authRef.current.hasRole('Author')).toBe(true)
    expect(authRef.current.hasRole('Administrator')).toBe(true)
    expect(authRef.current.hasRole('Editor')).toBe(false)
    expect(
      authRef.current.hasAnyRole(['Editor', 'Administrator']),
    ).toBe(true)
    expect(authRef.current.hasAnyRole(['Editor'])).toBe(false)
    expect(authRef.current.hasAnyRole([])).toBe(false)
  })

  it('fails closed for malformed user roles and malformed requirements', async () => {
    const { authRef } = await renderAuthenticated({
      id: 32,
      username: 'malformed_roles',
      roles: ['Editor', null],
    })

    expect(authRef.current.hasRole('Editor')).toBe(false)
    expect(authRef.current.hasRole('')).toBe(false)
    expect(authRef.current.hasRole(null)).toBe(false)
    expect(authRef.current.hasAnyRole(['Editor'])).toBe(false)
    expect(authRef.current.hasAnyRole(['Editor', ''])).toBe(false)
    expect(authRef.current.hasAnyRole('Editor')).toBe(false)
  })

  it('uses one rotating refresh during a StrictMode effect replay', async () => {
    const refreshDeferred = createDeferred()
    const currentUser = {
      id: 33,
      username: 'strict_mode_user',
      roles: ['Editor'],
    }

    tokenStorageMocks.getRefreshToken.mockReturnValue('refresh-token')
    authApiMocks.refreshSession.mockReturnValue(refreshDeferred.promise)
    authApiMocks.getCurrentUser.mockResolvedValue(currentUser)

    const { authRef } = renderAuthProvider({ strict: true })

    await waitFor(() => {
      expect(authApiMocks.refreshSession).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      refreshDeferred.resolve('rotated-access-token')
      await refreshDeferred.promise
    })

    await waitForStatus(AUTH_STATUS.AUTHENTICATED)
    expect(authApiMocks.refreshSession).toHaveBeenCalledTimes(1)
    expect(authApiMocks.getCurrentUser).toHaveBeenCalledTimes(1)
    expect(authRef.current.user).toBe(currentUser)
  })

  it('does not publish restoration state after unmount and unsubscribes', async () => {
    const refreshDeferred = createDeferred()
    const onSnapshot = vi.fn()

    tokenStorageMocks.getRefreshToken.mockReturnValue('refresh-token')
    authApiMocks.refreshSession.mockReturnValue(refreshDeferred.promise)
    authApiMocks.getCurrentUser.mockResolvedValue({
      id: 34,
      username: 'unmounted_user',
      roles: [],
    })

    const { unmount } = renderAuthProvider({ onSnapshot })

    expect(onSnapshot).toHaveBeenLastCalledWith({
      authError: null,
      status: AUTH_STATUS.CHECKING,
      user: null,
    })

    unmount()

    await act(async () => {
      refreshDeferred.resolve('access-token')
      await refreshDeferred.promise
      await Promise.resolve()
    })

    expect(onSnapshot).toHaveBeenCalledTimes(1)
    expect(sessionInvalidationMocks.unsubscribe).toHaveBeenCalledTimes(1)
  })
})
