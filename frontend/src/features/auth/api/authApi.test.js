import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiClientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('../../../lib/apiClient.js', () => ({
  apiClient: apiClientMocks,
}))

import { getCurrentUser, login, logout } from './authApi.js'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../storage/tokenStorage.js'
import { AUTH_ERROR_CODES, AuthError } from '../utils/authErrors.js'

function createAxiosError({ status, data, code } = {}) {
  const config = {
    data: JSON.stringify({ refresh: 'request-refresh-secret' }),
    headers: {
      Authorization: 'Bearer request-access-secret',
    },
  }
  const response = status
    ? {
        status,
        statusText: 'Request failed',
        data,
        headers: {},
        config,
      }
    : undefined

  return new AxiosError(
    'Axios request failed',
    code,
    config,
    {},
    response,
  )
}

describe('authentication API', () => {
  beforeEach(() => {
    apiClientMocks.get.mockReset()
    apiClientMocks.post.mockReset()
    clearAuthTokens()
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('posts the exact login contract, stores the token pair, and returns only the user', async () => {
    const user = {
      id: 1,
      username: 'author',
      email: 'author@example.com',
    }
    apiClientMocks.post.mockResolvedValue({
      data: {
        access: 'login-access',
        refresh: 'login-refresh',
        user,
      },
    })

    await expect(
      login({
        email: 'author@example.com',
        password: 'correct-password',
        ignored: 'not-sent',
      }),
    ).resolves.toEqual(user)

    expect(apiClientMocks.post).toHaveBeenCalledOnce()
    expect(apiClientMocks.post).toHaveBeenCalledWith('/auth/login/', {
      email: 'author@example.com',
      password: 'correct-password',
    })
    expect(getAccessToken()).toBe('login-access')
    expect(getRefreshToken()).toBe('login-refresh')
    expect(window.localStorage.length).toBe(1)
    expect(window.sessionStorage.length).toBe(0)
    expect(JSON.stringify(window.localStorage)).not.toContain('login-access')
    expect(JSON.stringify(window.localStorage)).not.toContain(user.email)
  })

  it('normalizes the exact invalid-credentials login response', async () => {
    apiClientMocks.post.mockRejectedValue(
      createAxiosError({
        status: 400,
        data: {
          non_field_errors: ['Invalid email or password.'],
        },
      }),
    )

    const loginPromise = login({
      email: 'author@example.com',
      password: 'wrong-password',
    })

    await expect(loginPromise).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      status: 400,
    })
    await expect(loginPromise).rejects.toBeInstanceOf(AuthError)
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('fails closed when a successful login cannot persist the refresh token', async () => {
    apiClientMocks.post.mockResolvedValue({
      data: {
        access: 'login-access',
        refresh: 'login-refresh',
        user: {
          id: 1,
          username: 'author',
          email: 'author@example.com',
        },
      },
    })
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Storage denied', 'SecurityError')
      })

    try {
      await expect(
        login({
          email: 'author@example.com',
          password: 'correct-password',
        }),
      ).rejects.toMatchObject({
        code: AUTH_ERROR_CODES.STORAGE_UNAVAILABLE,
      })
      expect(getAccessToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
    } finally {
      setItemSpy.mockRestore()
    }
  })

  it('gets the authoritative current user with the in-memory bearer token', async () => {
    const currentUser = {
      id: 1,
      username: 'author',
      email: 'author@example.com',
      first_name: 'Ada',
      last_name: 'Lovelace',
      roles: ['Author', 'Editor'],
    }
    setAuthTokens({ access: 'current-access', refresh: 'current-refresh' })
    apiClientMocks.get.mockResolvedValue({ data: currentUser })

    await expect(getCurrentUser()).resolves.toEqual(currentUser)

    expect(apiClientMocks.get).toHaveBeenCalledWith('/auth/me/', {
      headers: {
        Authorization: 'Bearer current-access',
      },
    })
  })

  it('does not request the current user without an in-memory access token', async () => {
    await expect(getCurrentUser()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
    })

    expect(apiClientMocks.get).not.toHaveBeenCalled()
  })

  it('clears stale access but preserves refresh after a current-user 401', async () => {
    setAuthTokens({ access: 'expired-access', refresh: 'retry-refresh' })
    apiClientMocks.get.mockRejectedValue(
      createAxiosError({
        status: 401,
        data: {
          detail: 'Token is invalid or expired',
          code: 'token_not_valid',
        },
      }),
    )

    await expect(getCurrentUser()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
      status: 401,
    })
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBe('retry-refresh')
  })

  it('posts the exact logout contract with bearer authorization and clears tokens', async () => {
    setAuthTokens({ access: 'logout-access', refresh: 'logout-refresh' })
    apiClientMocks.post.mockResolvedValue({
      data: { detail: 'Successfully logged out.' },
    })

    await expect(logout()).resolves.toBe('Successfully logged out.')

    expect(apiClientMocks.post).toHaveBeenCalledWith(
      '/auth/logout/',
      { refresh: 'logout-refresh' },
      {
        headers: {
          Authorization: 'Bearer logout-access',
        },
      },
    )
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('clears local tokens and rethrows a normalized error when logout fails', async () => {
    setAuthTokens({ access: 'logout-access', refresh: 'logout-refresh' })
    apiClientMocks.post.mockRejectedValue(
      createAxiosError({ code: AxiosError.ERR_NETWORK }),
    )

    await expect(logout()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.NETWORK,
    })
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('rejects logout safely without making a request when local credentials are absent', async () => {
    await expect(logout()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
    })

    expect(apiClientMocks.post).not.toHaveBeenCalled()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
