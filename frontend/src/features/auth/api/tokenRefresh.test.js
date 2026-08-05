import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const refreshClientMocks = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => refreshClientMocks),
      isAxiosError: actual.default.isAxiosError,
    },
  }
})

import { refreshSession } from './tokenRefresh.js'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../storage/tokenStorage.js'
import { AUTH_ERROR_CODES } from '../utils/authErrors.js'

function createAxiosError({ status, data, code } = {}) {
  const config = {
    data: JSON.stringify({ refresh: 'old-refresh' }),
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

describe('refreshSession', () => {
  beforeEach(() => {
    refreshClientMocks.post.mockReset()
    clearAuthTokens()
    window.localStorage.clear()
  })

  it('posts the current refresh token and atomically replaces the rotated pair', async () => {
    setAuthTokens({ access: 'old-access', refresh: 'old-refresh' })
    refreshClientMocks.post.mockResolvedValue({
      data: {
        access: 'rotated-access',
        refresh: 'rotated-refresh',
      },
    })

    await expect(refreshSession()).resolves.toBe('rotated-access')

    expect(refreshClientMocks.post).toHaveBeenCalledOnce()
    expect(refreshClientMocks.post).toHaveBeenCalledWith(
      '/auth/token/refresh/',
      { refresh: 'old-refresh' },
    )
    expect(getAccessToken()).toBe('rotated-access')
    expect(getRefreshToken()).toBe('rotated-refresh')
    expect(window.localStorage.length).toBe(1)
    expect(JSON.stringify(window.localStorage)).not.toContain('rotated-access')
  })

  it('rejects without a request and clears stale access when refresh is missing', async () => {
    setAuthTokens({ access: 'stale-access', refresh: 'removed-refresh' })
    window.localStorage.clear()

    await expect(refreshSession()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
    })

    expect(refreshClientMocks.post).not.toHaveBeenCalled()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('clears both tokens after a definitive invalid or blacklisted refresh rejection', async () => {
    setAuthTokens({ access: 'expired-access', refresh: 'blacklisted-refresh' })
    refreshClientMocks.post.mockRejectedValue(
      createAxiosError({
        status: 401,
        data: {
          detail: 'Token is blacklisted',
          code: 'token_not_valid',
        },
      }),
    )

    await expect(refreshSession()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
      status: 401,
    })
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('maps the backend 400 refresh rejection and clears both tokens', async () => {
    setAuthTokens({ access: 'expired-access', refresh: 'invalid-refresh' })
    refreshClientMocks.post.mockRejectedValue(
      createAxiosError({
        status: 400,
        data: {
          refresh: ['Invalid or expired refresh token.'],
        },
      }),
    )

    await expect(refreshSession()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
      status: 400,
    })
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('clears access but preserves refresh after a temporary network failure', async () => {
    setAuthTokens({ access: 'stale-access', refresh: 'retry-refresh' })
    refreshClientMocks.post.mockRejectedValue(
      createAxiosError({ code: AxiosError.ERR_NETWORK }),
    )

    await expect(refreshSession()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.NETWORK,
    })
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBe('retry-refresh')
  })

  it('clears access but preserves refresh after an unexpected server failure', async () => {
    setAuthTokens({ access: 'stale-access', refresh: 'retry-refresh' })
    refreshClientMocks.post.mockRejectedValue(
      createAxiosError({
        status: 503,
        data: { detail: 'Service unavailable' },
      }),
    )

    await expect(refreshSession()).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.SERVER,
      status: 503,
    })
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBe('retry-refresh')
  })

  it('fails closed if the rotated pair cannot be persisted', async () => {
    setAuthTokens({ access: 'old-access', refresh: 'old-refresh' })
    refreshClientMocks.post.mockResolvedValue({
      data: {
        access: 'rotated-access',
        refresh: 'rotated-refresh',
      },
    })
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Storage denied', 'SecurityError')
      })

    try {
      await expect(refreshSession()).rejects.toMatchObject({
        code: AUTH_ERROR_CODES.STORAGE_UNAVAILABLE,
      })
      expect(getAccessToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
    } finally {
      setItemSpy.mockRestore()
    }
  })
})
