import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { refreshSessionMock } = vi.hoisted(() => ({
  refreshSessionMock: vi.fn(),
}))

vi.mock('../features/auth/api/tokenRefresh.js', () => ({
  refreshSession: refreshSessionMock,
}))

import {
  notifySessionInvalidated,
  subscribeToSessionInvalidation,
} from '../features/auth/events/sessionInvalidation.js'
import {
  clearAccessToken,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../features/auth/storage/tokenStorage.js'
import {
  AUTH_ERROR_CODES,
  createAuthError,
} from '../features/auth/utils/authErrors.js'
import { apiClient } from './apiClient.js'

const REFRESH_STORAGE_KEY = 'blog-platform.auth.refresh-token'

function getHeader(config, name) {
  return config.headers?.get?.(name) ?? config.headers?.[name]
}

function storeTokens(access = 'access-old', refresh = 'refresh-old') {
  expect(setAuthTokens({ access, refresh })).toBe(true)
}

describe('apiClient authentication interceptors', () => {
  let httpMock

  beforeEach(() => {
    clearAuthTokens()
    refreshSessionMock.mockReset()
    httpMock = new MockAdapter(apiClient, { onNoMatch: 'throwException' })
  })

  afterEach(() => {
    httpMock.restore()
    clearAuthTokens()
  })

  it('reads and attaches the current access token for each trusted request', async () => {
    const receivedHeaders = []

    httpMock.onGet('/posts/').reply((config) => {
      receivedHeaders.push(getHeader(config, 'Authorization'))
      return [200, {}]
    })

    storeTokens('access-one', 'refresh-one')
    await apiClient.get('/posts/')

    storeTokens('access-two', 'refresh-two')
    await apiClient.get('/posts/')

    expect(receivedHeaders).toEqual([
      'Bearer access-one',
      'Bearer access-two',
    ])
  })

  it('does not attach a bearer header when no access token exists', async () => {
    httpMock.onGet('/posts/').reply((config) => {
      expect(getHeader(config, 'Authorization')).toBeUndefined()
      return [200, {}]
    })

    await apiClient.get('/posts/')
  })

  it('preserves a caller-supplied Authorization header', async () => {
    storeTokens()
    httpMock.onGet('/posts/').reply((config) => {
      expect(getHeader(config, 'Authorization')).toBe('Bearer explicit')
      return [200, {}]
    })

    await apiClient.get('/posts/', {
      headers: {
        authorization: 'Bearer explicit',
      },
    })
  })

  it('does not attach credentials outside the configured API scope', async () => {
    storeTokens()
    const urls = [
      'https://evil.example/posts/',
      'http://api.test/outside-api',
    ]

    for (const url of urls) {
      httpMock.onGet(url).reply((config) => {
        expect(getHeader(config, 'Authorization')).toBeUndefined()
        return [200, {}]
      })

      await apiClient.get(url)
    }
  })

  it('does not impose a global Content-Type or alter FormData payloads', async () => {
    const body = new FormData()
    body.append('title', 'Draft')

    expect(apiClient.defaults.headers.common['Content-Type']).toBeUndefined()

    httpMock.onPost('/uploads/').reply((config) => {
      expect(config.data).toBe(body)
      return [201, {}]
    })

    await apiClient.post('/uploads/', body)
  })

  it('refreshes once and retries one failed protected request once', async () => {
    storeTokens()
    let requestCount = 0

    refreshSessionMock.mockImplementation(async () => {
      storeTokens('access-new', 'refresh-new')
      return 'access-new'
    })
    httpMock.onGet('/protected/').reply((config) => {
      requestCount += 1

      if (requestCount === 1) {
        expect(getHeader(config, 'Authorization')).toBe('Bearer access-old')
        return [401, {}]
      }

      expect(getHeader(config, 'Authorization')).toBe('Bearer access-new')
      return [200, { ok: true }]
    })

    const response = await apiClient.get('/protected/')

    expect(response.data).toEqual({ ok: true })
    expect(refreshSessionMock).toHaveBeenCalledTimes(1)
    expect(requestCount).toBe(2)
    expect(getRefreshToken()).toBe('refresh-new')
  })

  it('shares one refresh across concurrent 401 responses', async () => {
    storeTokens()
    let releaseRefresh
    let oldTokenRequests = 0
    let newTokenRequests = 0

    refreshSessionMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseRefresh = () => {
            storeTokens('access-new', 'refresh-new')
            resolve('access-new')
          }
        }),
    )
    httpMock.onGet('/protected/').reply((config) => {
      const authorization = getHeader(config, 'Authorization')

      if (authorization === 'Bearer access-old') {
        oldTokenRequests += 1
        return [401, {}]
      }

      newTokenRequests += 1
      expect(authorization).toBe('Bearer access-new')
      return [200, {}]
    })

    const requests = [
      apiClient.get('/protected/'),
      apiClient.get('/protected/'),
      apiClient.get('/protected/'),
    ]

    await vi.waitFor(() => {
      expect(refreshSessionMock).toHaveBeenCalledTimes(1)
    })
    releaseRefresh()
    await Promise.all(requests)

    expect(oldTokenRequests).toBe(3)
    expect(newTokenRequests).toBe(3)
    expect(getRefreshToken()).toBe('refresh-new')
  })

  it('invalidates instead of retrying a request more than once', async () => {
    storeTokens()
    const listener = vi.fn()
    const unsubscribe = subscribeToSessionInvalidation(listener)

    refreshSessionMock.mockImplementation(async () => {
      storeTokens('access-new', 'refresh-new')
      return 'access-new'
    })
    httpMock.onGet('/protected/').reply(401, {})

    await expect(apiClient.get('/protected/')).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
    })

    expect(refreshSessionMock).toHaveBeenCalledTimes(1)
    expect(httpMock.history.get).toHaveLength(2)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    unsubscribe()
  })

  it.each([
    '/auth/login/',
    '/auth/logout/',
    '/auth/token/refresh/',
    '/auth/token/verify/',
  ])('does not refresh a 401 from %s', async (url) => {
    storeTokens()
    httpMock.onPost(url).reply(401, {})

    await expect(apiClient.post(url, {})).rejects.toBeDefined()

    expect(refreshSessionMock).not.toHaveBeenCalled()
    expect(httpMock.history.post).toHaveLength(1)
  })

  it('does not refresh explicitly skipped or caller-authorized requests', async () => {
    storeTokens()
    httpMock.onGet('/protected/').reply(401, {})

    await expect(
      apiClient.get('/protected/', { _skipAuthRefresh: true }),
    ).rejects.toBeDefined()
    await expect(
      apiClient.get('/protected/', {
        headers: { Authorization: 'Bearer explicit' },
      }),
    ).rejects.toBeDefined()

    expect(refreshSessionMock).not.toHaveBeenCalled()
  })

  it('clears and invalidates a protected 401 when no refresh exists', async () => {
    storeTokens()
    window.localStorage.removeItem(REFRESH_STORAGE_KEY)
    const listener = vi.fn()
    const unsubscribe = subscribeToSessionInvalidation(listener)
    httpMock.onGet('/protected/').reply(401, {})

    await expect(apiClient.get('/protected/')).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
    })

    expect(refreshSessionMock).not.toHaveBeenCalled()
    expect(getAccessToken()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('notifies once and clears definitive refresh rejection', async () => {
    storeTokens()
    const listener = vi.fn()
    const unsubscribe = subscribeToSessionInvalidation(listener)
    const unauthorized = createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)
    let rejectRefresh

    refreshSessionMock.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          void resolve
          rejectRefresh = () => {
            clearAuthTokens()
            reject(unauthorized)
          }
        }),
    )
    httpMock.onGet('/protected/').reply(401, {})

    const requests = [
      apiClient.get('/protected/'),
      apiClient.get('/protected/'),
      apiClient.get('/protected/'),
    ]

    await vi.waitFor(() => {
      expect(refreshSessionMock).toHaveBeenCalledTimes(1)
    })
    rejectRefresh()
    const results = await Promise.allSettled(requests)

    expect(results.every((result) => result.status === 'rejected')).toBe(true)
    expect(refreshSessionMock).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    unsubscribe()
  })

  it('preserves refresh but invalidates on a temporary refresh failure', async () => {
    storeTokens()
    const listener = vi.fn()
    const unsubscribe = subscribeToSessionInvalidation(listener)
    const networkError = createAuthError(AUTH_ERROR_CODES.NETWORK)

    refreshSessionMock.mockImplementation(async () => {
      clearAccessToken()
      throw networkError
    })
    httpMock.onGet('/protected/').reply(401, {})

    await expect(apiClient.get('/protected/')).rejects.toBe(networkError)

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBe('refresh-old')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('clears the failed refresh promise so a later request can retry', async () => {
    storeTokens()
    const networkError = createAuthError(AUTH_ERROR_CODES.NETWORK)

    refreshSessionMock.mockRejectedValueOnce(networkError)
    httpMock.onGet('/protected/').replyOnce(401, {})
    await expect(apiClient.get('/protected/')).rejects.toBe(networkError)

    storeTokens()
    refreshSessionMock.mockImplementationOnce(async () => {
      storeTokens('access-new', 'refresh-new')
      return 'access-new'
    })
    httpMock
      .onGet('/protected/')
      .replyOnce(401, {})
      .onGet('/protected/')
      .replyOnce(200, {})

    await expect(apiClient.get('/protected/')).resolves.toMatchObject({
      status: 200,
    })
    expect(refreshSessionMock).toHaveBeenCalledTimes(2)
  })

  it('installs one application-lifetime interceptor pair', () => {
    const requestHandlers = apiClient.interceptors.request.handlers.filter(
      Boolean,
    )
    const responseHandlers = apiClient.interceptors.response.handlers.filter(
      Boolean,
    )

    expect(requestHandlers).toHaveLength(1)
    expect(responseHandlers).toHaveLength(1)
  })

  it('does not leak notification errors back into the interceptor', () => {
    const unsubscribe = subscribeToSessionInvalidation(() => {
      throw new Error('listener failure')
    })

    expect(() =>
      notifySessionInvalidated(
        createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED),
      ),
    ).not.toThrow()
    unsubscribe()
  })
})
