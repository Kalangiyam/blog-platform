import axios, { AxiosHeaders } from 'axios'

import { environment } from '../config/environment.js'
import { refreshSession } from '../features/auth/api/tokenRefresh.js'
import { notifySessionInvalidated } from '../features/auth/events/sessionInvalidation.js'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
} from '../features/auth/storage/tokenStorage.js'
import {
  AUTH_ERROR_CODES,
  createAuthError,
  normalizeAuthError,
} from '../features/auth/utils/authErrors.js'

const EXCLUDED_REFRESH_PATHS = new Set([
  '/auth/login',
  '/auth/logout',
  '/auth/token/refresh',
  '/auth/token/verify',
])

const trustedApiUrl = new URL(environment.apiBaseUrl)
const trustedApiPath = trustedApiUrl.pathname.replace(/\/+$/, '') || '/'

let refreshPromise = null

export const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
})

function getRequestUrl(config) {
  try {
    return new URL(apiClient.getUri(config))
  } catch {
    return null
  }
}

function isTrustedApiRequest(config) {
  const requestUrl = getRequestUrl(config)

  if (!requestUrl || requestUrl.origin !== trustedApiUrl.origin) {
    return false
  }

  return (
    trustedApiPath === '/' ||
    requestUrl.pathname === trustedApiPath ||
    requestUrl.pathname.startsWith(`${trustedApiPath}/`)
  )
}

function getApiRelativePath(config) {
  if (!isTrustedApiRequest(config)) {
    return null
  }

  const requestUrl = getRequestUrl(config)
  const relativePath = requestUrl.pathname.slice(trustedApiPath.length)
  const normalizedPath = `/${relativePath.replace(/^\/+/, '')}`.replace(
    /\/+$/,
    '',
  )

  return normalizedPath || '/'
}

function attachAccessToken(config) {
  if (!isTrustedApiRequest(config)) {
    return config
  }

  const headers = AxiosHeaders.from(config.headers)

  if (headers.has('Authorization')) {
    if (!config._authHeaderAttached) {
      config._authAuthorizationExplicit = true
    }

    config.headers = headers
    return config
  }

  config._authAuthorizationExplicit = false

  const accessToken = getAccessToken()

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
    config._authHeaderAttached = true
  }

  config.headers = headers
  return config
}

function isRefreshEligible(error) {
  const config = error.config

  if (
    error.response?.status !== 401 ||
    !config ||
    config._authRetryAttempted ||
    config._skipAuthRefresh ||
    config._authAuthorizationExplicit ||
    !isTrustedApiRequest(config)
  ) {
    return false
  }

  return !EXCLUDED_REFRESH_PATHS.has(getApiRelativePath(config))
}

function getRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = refreshSession()
      .catch((error) => {
        const authError = normalizeAuthError(error, 'refresh')
        notifySessionInvalidated(authError)
        throw authError
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

async function handleAuthenticationError(error) {
  if (
    error.response?.status === 401 &&
    error.config?._authRetryAttempted &&
    isTrustedApiRequest(error.config)
  ) {
    const authError = normalizeAuthError(error, 'current-user')

    clearAuthTokens()
    notifySessionInvalidated(authError)

    return Promise.reject(authError)
  }

  if (!isRefreshEligible(error)) {
    return Promise.reject(error)
  }

  const config = error.config

  if (!refreshPromise && !getRefreshToken()) {
    const authError = createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)

    clearAuthTokens()
    notifySessionInvalidated(authError)

    return Promise.reject(authError)
  }

  config._authRetryAttempted = true

  try {
    const accessToken = await getRefreshPromise()
    const headers = AxiosHeaders.from(config.headers)

    headers.set('Authorization', `Bearer ${accessToken}`)
    config.headers = headers
    config._authHeaderAttached = true

    return apiClient(config)
  } catch (refreshError) {
    return Promise.reject(normalizeAuthError(refreshError, 'refresh'))
  }
}

apiClient.interceptors.request.use(attachAccessToken)
apiClient.interceptors.response.use(
  (response) => response,
  handleAuthenticationError,
)
