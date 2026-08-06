import axios from 'axios'

export const PROFILE_ERROR_CODES = Object.freeze({
  NOT_FOUND: 'not_found',
  UNAUTHENTICATED: 'unauthenticated',
  FORBIDDEN: 'forbidden',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
  CANCELLED: 'cancelled',
  UNKNOWN_ERROR: 'unknown_error',
})

/**
 * Normalizes an API error response or Axios exception into a safe,
 * standardized profile error representation.
 *
 * @param {any} error
 * @returns {{ code: string, message: string, fieldErrors: Record<string, string[]>, detail: string|null }}
 */
export function normalizeProfileError(error) {
  if (!error) {
    return {
      code: PROFILE_ERROR_CODES.UNKNOWN_ERROR,
      message: 'An unexpected profile error occurred.',
      fieldErrors: {},
      detail: null,
    }
  }

  // Handle request cancellation
  if (axios.isCancel(error) || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
    return {
      code: PROFILE_ERROR_CODES.CANCELLED,
      message: 'Profile request was cancelled.',
      fieldErrors: {},
      detail: null,
    }
  }

  // Handle auth error codes from apiClient interceptors
  if (error?.code === 'unauthorized') {
    return {
      code: PROFILE_ERROR_CODES.UNAUTHENTICATED,
      message: 'You must be logged in to view or modify this profile.',
      fieldErrors: {},
      detail: typeof error.detail === 'string' ? error.detail : null,
    }
  }

  // Already normalized profile error
  if (typeof error === 'object' && typeof error.code === 'string' && Object.values(PROFILE_ERROR_CODES).includes(error.code)) {
    return error
  }

  const response = error.response

  if (response) {
    const status = response.status
    const data = response.data

    if (status === 404) {
      return {
        code: PROFILE_ERROR_CODES.NOT_FOUND,
        message: 'The requested profile was not found.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 401) {
      return {
        code: PROFILE_ERROR_CODES.UNAUTHENTICATED,
        message: 'You must be logged in to view or modify this profile.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 403) {
      return {
        code: PROFILE_ERROR_CODES.FORBIDDEN,
        message: 'You do not have permission to access or modify this profile.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 400) {
      const fieldErrors = {}
      let detailMessage = 'Please fix the highlighted profile errors.'

      if (data && typeof data === 'object') {
        if (typeof data.detail === 'string') {
          detailMessage = data.detail
        }

        for (const [key, val] of Object.entries(data)) {
          if (key === 'detail') continue
          if (Array.isArray(val)) {
            fieldErrors[key] = val.map((item) => String(item))
          } else if (typeof val === 'string') {
            fieldErrors[key] = [val]
          }
        }
      }

      return {
        code: PROFILE_ERROR_CODES.VALIDATION_ERROR,
        message: detailMessage,
        fieldErrors,
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status >= 500) {
      return {
        code: PROFILE_ERROR_CODES.SERVER_ERROR,
        message: 'A server error occurred while processing the profile. Please try again later.',
        fieldErrors: {},
        detail: null,
      }
    }
  }

  // Network / connection errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error') || !response) {
    return {
      code: PROFILE_ERROR_CODES.NETWORK_ERROR,
      message: 'Network connection error. Please check your connection and try again.',
      fieldErrors: {},
      detail: null,
    }
  }

  return {
    code: PROFILE_ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unexpected profile error occurred.',
    fieldErrors: {},
    detail: null,
  }
}
