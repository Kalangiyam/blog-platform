import axios from 'axios'

export const ADMIN_USER_ERROR_CODES = Object.freeze({
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
 * standardized administrative user error representation.
 *
 * @param {any} error
 * @returns {{ code: string, message: string, fieldErrors: Record<string, string[]>, detail: string|null }}
 */
export function normalizeAdminUserError(error) {
  if (!error) {
    return {
      code: ADMIN_USER_ERROR_CODES.UNKNOWN_ERROR,
      message: 'An unexpected administrative error occurred.',
      fieldErrors: {},
      detail: null,
    }
  }

  // Handle request cancellation
  if (
    axios.isCancel(error) ||
    error?.name === 'CanceledError' ||
    error?.code === 'ERR_CANCELED'
  ) {
    return {
      code: ADMIN_USER_ERROR_CODES.CANCELLED,
      message: 'User administration request was cancelled.',
      fieldErrors: {},
      detail: null,
    }
  }

  // Handle auth error codes from apiClient interceptors
  if (error?.code === 'unauthorized') {
    return {
      code: ADMIN_USER_ERROR_CODES.UNAUTHENTICATED,
      message: 'Your session has expired. Please log in again.',
      fieldErrors: {},
      detail: typeof error.detail === 'string' ? error.detail : null,
    }
  }

  // Already normalized admin user error
  if (
    typeof error === 'object' &&
    typeof error.code === 'string' &&
    Object.values(ADMIN_USER_ERROR_CODES).includes(error.code)
  ) {
    return error
  }

  const response = error.response

  if (response) {
    const status = response.status
    const data = response.data

    if (status === 404) {
      return {
        code: ADMIN_USER_ERROR_CODES.NOT_FOUND,
        message: 'The requested user was not found.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 401) {
      return {
        code: ADMIN_USER_ERROR_CODES.UNAUTHENTICATED,
        message: 'Your session has expired. Please log in again.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 403) {
      return {
        code: ADMIN_USER_ERROR_CODES.FORBIDDEN,
        message: 'Administrator permission is required for this action.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 400) {
      const fieldErrors = {}
      let detailMessage = 'Please fix the highlighted errors.'

      if (data && typeof data === 'object') {
        if (typeof data.detail === 'string') {
          detailMessage = data.detail
        } else if (typeof data.non_field_errors === 'string') {
          detailMessage = data.non_field_errors
        } else if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
          detailMessage = data.non_field_errors.join(' ')
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
        code: ADMIN_USER_ERROR_CODES.VALIDATION_ERROR,
        message: detailMessage,
        fieldErrors,
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status >= 500) {
      return {
        code: ADMIN_USER_ERROR_CODES.SERVER_ERROR,
        message: 'A server error occurred. Please try again later.',
        fieldErrors: {},
        detail: null,
      }
    }
  }

  // Network / connection errors
  if (
    error.code === 'ECONNABORTED' ||
    error.message?.includes('Network Error') ||
    !response
  ) {
    return {
      code: ADMIN_USER_ERROR_CODES.NETWORK_ERROR,
      message: 'Network connection error. Please check your connection and try again.',
      fieldErrors: {},
      detail: null,
    }
  }

  return {
    code: ADMIN_USER_ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unexpected administrative error occurred.',
    fieldErrors: {},
    detail: null,
  }
}
