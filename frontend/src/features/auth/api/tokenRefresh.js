import axios from 'axios'

import { environment } from '../../../config/environment.js'
import {
  clearAccessToken,
  clearAuthTokens,
  getRefreshToken,
  setAuthTokens,
} from '../storage/tokenStorage.js'
import {
  AUTH_ERROR_CODES,
  createAuthError,
  normalizeAuthError,
} from '../utils/authErrors.js'

const refreshClient = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
})

export async function refreshSession() {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearAccessToken()
    throw createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED)
  }

  try {
    const { data } = await refreshClient.post('/auth/token/refresh/', {
      refresh: refreshToken,
    })

    if (!setAuthTokens(data)) {
      throw createAuthError(AUTH_ERROR_CODES.STORAGE_UNAVAILABLE)
    }

    return data.access
  } catch (error) {
    const authError = normalizeAuthError(error, 'refresh')

    clearAccessToken()

    if (
      authError.code === AUTH_ERROR_CODES.UNAUTHORIZED ||
      authError.code === AUTH_ERROR_CODES.STORAGE_UNAVAILABLE
    ) {
      clearAuthTokens()
    }

    throw authError
  }
}
