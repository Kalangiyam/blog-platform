import { beforeEach, describe, expect, it, vi } from 'vitest'

const authApiMocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  refreshSession: vi.fn(),
}))

const tokenStorageMocks = vi.hoisted(() => ({
  clearAccessToken: vi.fn(),
  clearAuthTokens: vi.fn(),
  getRefreshToken: vi.fn(),
}))

vi.mock('../api/authApi.js', () => authApiMocks)
vi.mock('../storage/tokenStorage.js', () => tokenStorageMocks)

import { AUTH_STATUS } from './AuthContext.js'
import { restoreSession } from './sessionRestoration.js'
import {
  AUTH_ERROR_CODES,
  createAuthError,
} from '../utils/authErrors.js'

function createDeferred() {
  let resolve
  let reject

  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, reject, resolve }
}

beforeEach(() => {
  for (const mock of Object.values(authApiMocks)) {
    mock.mockReset()
  }

  for (const mock of Object.values(tokenStorageMocks)) {
    mock.mockReset()
  }

  tokenStorageMocks.getRefreshToken.mockReturnValue(null)
  tokenStorageMocks.clearAuthTokens.mockReturnValue(true)
})

describe('restoreSession', () => {
  it('settles unauthenticated without making requests when no refresh token exists', async () => {
    await expect(restoreSession()).resolves.toEqual({
      user: null,
      status: AUTH_STATUS.UNAUTHENTICATED,
      authError: null,
    })

    expect(authApiMocks.refreshSession).not.toHaveBeenCalled()
    expect(authApiMocks.getCurrentUser).not.toHaveBeenCalled()
    expect(tokenStorageMocks.clearAccessToken).not.toHaveBeenCalled()
    expect(tokenStorageMocks.clearAuthTokens).not.toHaveBeenCalled()
  })

  it('refreshes first and returns the authoritative current user', async () => {
    const currentUser = {
      id: 7,
      username: 'author_editor',
      email: 'author@example.com',
      first_name: 'Ada',
      last_name: 'Writer',
      roles: ['Author', 'Editor'],
    }

    tokenStorageMocks.getRefreshToken.mockReturnValue('refresh-token')
    authApiMocks.refreshSession.mockResolvedValue('access-token')
    authApiMocks.getCurrentUser.mockResolvedValue(currentUser)

    await expect(restoreSession()).resolves.toEqual({
      user: currentUser,
      status: AUTH_STATUS.AUTHENTICATED,
      authError: null,
    })

    expect(authApiMocks.refreshSession).toHaveBeenCalledTimes(1)
    expect(authApiMocks.getCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('clears definitive invalid credentials and settles unauthenticated', async () => {
    const authError = createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)

    tokenStorageMocks.getRefreshToken.mockReturnValue('invalid-refresh')
    authApiMocks.refreshSession.mockRejectedValue(authError)

    await expect(restoreSession()).resolves.toEqual({
      user: null,
      status: AUTH_STATUS.UNAUTHENTICATED,
      authError,
    })

    expect(authApiMocks.getCurrentUser).not.toHaveBeenCalled()
    expect(tokenStorageMocks.clearAccessToken).toHaveBeenCalledTimes(1)
    expect(tokenStorageMocks.clearAuthTokens).toHaveBeenCalledTimes(1)
  })

  it('preserves the refresh token on a temporary restoration failure', async () => {
    const authError = createAuthError(AUTH_ERROR_CODES.NETWORK)

    tokenStorageMocks.getRefreshToken.mockReturnValue('valid-refresh')
    authApiMocks.refreshSession.mockRejectedValue(authError)

    await expect(restoreSession()).resolves.toEqual({
      user: null,
      status: AUTH_STATUS.UNAUTHENTICATED,
      authError,
    })

    expect(tokenStorageMocks.clearAccessToken).toHaveBeenCalledTimes(1)
    expect(tokenStorageMocks.clearAuthTokens).not.toHaveBeenCalled()
  })

  it('clears credentials when current-user lookup rejects the refreshed session', async () => {
    const authError = createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)

    tokenStorageMocks.getRefreshToken.mockReturnValue('refresh-token')
    authApiMocks.refreshSession.mockResolvedValue('access-token')
    authApiMocks.getCurrentUser.mockRejectedValue(authError)

    await expect(restoreSession()).resolves.toEqual({
      user: null,
      status: AUTH_STATUS.UNAUTHENTICATED,
      authError,
    })

    expect(tokenStorageMocks.clearAccessToken).toHaveBeenCalledTimes(1)
    expect(tokenStorageMocks.clearAuthTokens).toHaveBeenCalledTimes(1)
  })

  it('shares one in-flight rotation and releases the guard after settlement', async () => {
    const refreshDeferred = createDeferred()
    const currentUser = {
      id: 9,
      username: 'strict_user',
      roles: ['Author'],
    }

    tokenStorageMocks.getRefreshToken.mockReturnValue('refresh-token')
    authApiMocks.refreshSession.mockReturnValueOnce(refreshDeferred.promise)
    authApiMocks.getCurrentUser.mockResolvedValue(currentUser)

    const firstRestoration = restoreSession()
    const secondRestoration = restoreSession()

    expect(secondRestoration).toBe(firstRestoration)
    expect(authApiMocks.refreshSession).toHaveBeenCalledTimes(1)

    refreshDeferred.resolve('access-token')

    await expect(firstRestoration).resolves.toEqual({
      user: currentUser,
      status: AUTH_STATUS.AUTHENTICATED,
      authError: null,
    })

    authApiMocks.refreshSession.mockResolvedValueOnce('new-access-token')

    const laterRestoration = restoreSession()

    expect(laterRestoration).not.toBe(firstRestoration)
    await expect(laterRestoration).resolves.toMatchObject({
      status: AUTH_STATUS.AUTHENTICATED,
    })
    expect(authApiMocks.refreshSession).toHaveBeenCalledTimes(2)
  })
})
