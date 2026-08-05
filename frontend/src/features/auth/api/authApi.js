import { apiClient } from '../../../lib/apiClient.js'
import {
  clearAccessToken,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../storage/tokenStorage.js'
import {
  AUTH_ERROR_CODES,
  createAuthError,
  normalizeAuthError,
} from '../utils/authErrors.js'

export { refreshSession } from './tokenRefresh.js'

function getAuthorizationConfig(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
}

export async function login({ email, password } = {}) {
  try {
    const { data } = await apiClient.post('/auth/login/', {
      email,
      password,
    })

    if (!setAuthTokens(data)) {
      throw createAuthError(AUTH_ERROR_CODES.STORAGE_UNAVAILABLE)
    }

    return data.user
  } catch (error) {
    throw normalizeAuthError(error, 'login')
  }
}

export async function getCurrentUser() {
  const accessToken = getAccessToken()

  if (!accessToken) {
    throw createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)
  }

  try {
    const { data } = await apiClient.get(
      '/auth/me/',
      getAuthorizationConfig(accessToken),
    )

    return data
  } catch (error) {
    const authError = normalizeAuthError(error, 'current-user')

    if (authError.code === AUTH_ERROR_CODES.UNAUTHORIZED) {
      clearAccessToken()
    }

    throw authError
  }
}

export async function logout() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  let detail
  let requestError = null

  try {
    if (!accessToken || !refreshToken) {
      throw createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)
    }

    const { data } = await apiClient.post(
      '/auth/logout/',
      {
        refresh: refreshToken,
      },
      getAuthorizationConfig(accessToken),
    )

    detail = data.detail
  } catch (error) {
    requestError = normalizeAuthError(error, 'logout')
  }

  if (!clearAuthTokens()) {
    throw createAuthError(AUTH_ERROR_CODES.STORAGE_UNAVAILABLE)
  }

  if (requestError) {
    throw requestError
  }

  return detail
}
