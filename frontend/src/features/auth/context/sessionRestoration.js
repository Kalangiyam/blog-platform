import { getCurrentUser, refreshSession } from '../api/authApi.js'
import {
  clearAccessToken,
  clearAuthTokens,
  getRefreshToken,
} from '../storage/tokenStorage.js'
import {
  AUTH_ERROR_CODES,
  normalizeAuthError,
} from '../utils/authErrors.js'
import { AUTH_STATUS } from './AuthContext.js'

let sessionRestorationPromise = null

function isDefinitiveSessionError(authError) {
  return (
    authError.code === AUTH_ERROR_CODES.UNAUTHORIZED ||
    authError.code === AUTH_ERROR_CODES.STORAGE_UNAVAILABLE
  )
}

function createUnauthenticatedResult(authError = null) {
  return {
    user: null,
    status: AUTH_STATUS.UNAUTHENTICATED,
    authError,
  }
}

async function runSessionRestoration() {
  if (!getRefreshToken()) {
    return createUnauthenticatedResult()
  }

  try {
    await refreshSession()
    const user = await getCurrentUser()

    return {
      user,
      status: AUTH_STATUS.AUTHENTICATED,
      authError: null,
    }
  } catch (error) {
    const authError = normalizeAuthError(error, 'session-restoration')

    clearAccessToken()

    if (isDefinitiveSessionError(authError)) {
      clearAuthTokens()
    }

    return createUnauthenticatedResult(authError)
  }
}

export function restoreSession() {
  if (!sessionRestorationPromise) {
    sessionRestorationPromise = runSessionRestoration().finally(() => {
      sessionRestorationPromise = null
    })
  }

  return sessionRestorationPromise
}
