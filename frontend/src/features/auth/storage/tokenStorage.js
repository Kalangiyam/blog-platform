const REFRESH_TOKEN_STORAGE_KEY = 'blog-platform.auth.refresh-token'

let accessToken = null

function isToken(value) {
  return typeof value === 'string' && value.length > 0
}

function getBrowserStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getAccessToken() {
  return accessToken
}

export function getRefreshToken() {
  const storage = getBrowserStorage()

  if (!storage) {
    return null
  }

  try {
    const refreshToken = storage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    return isToken(refreshToken) ? refreshToken : null
  } catch {
    return null
  }
}

export function setAuthTokens({ access, refresh } = {}) {
  if (!isToken(access) || !isToken(refresh)) {
    clearAuthTokens()
    return false
  }

  const storage = getBrowserStorage()

  if (!storage) {
    accessToken = null
    return false
  }

  try {
    storage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh)
    accessToken = access
    return true
  } catch {
    accessToken = null

    try {
      storage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    } catch {
      // Storage remains unavailable; the access token is still cleared.
    }

    return false
  }
}

export function clearAccessToken() {
  accessToken = null
}

export function clearAuthTokens() {
  clearAccessToken()

  const storage = getBrowserStorage()

  if (!storage) {
    return false
  }

  try {
    storage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
