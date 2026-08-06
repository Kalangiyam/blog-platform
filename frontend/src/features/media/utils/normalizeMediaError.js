import axios from 'axios'

export const MEDIA_ERROR_CODES = Object.freeze({
  CANCELLED: 'cancelled',
  UNAUTHENTICATED: 'unauthenticated',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',
  UNKNOWN_ERROR: 'unknown_error',
})

/**
 * Normalizes any error (Axios error, network error, DRF error response, or client error)
 * into a safe, predictable MediaError representation.
 *
 * @param {any} error
 * @returns {{ code: string, message: string, fieldErrors: Record<string, string[]>, detail: string|null }}
 */
export function normalizeMediaError(error) {
  if (!error) {
    return {
      code: MEDIA_ERROR_CODES.UNKNOWN_ERROR,
      message: 'An unexpected media error occurred.',
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
      code: MEDIA_ERROR_CODES.CANCELLED,
      message: 'Media upload or operation was cancelled.',
      fieldErrors: {},
      detail: null,
    }
  }

  // Handle auth error codes from apiClient interceptors
  if (error?.code === 'unauthorized') {
    return {
      code: MEDIA_ERROR_CODES.UNAUTHENTICATED,
      message: 'You must be logged in to modify post media.',
      fieldErrors: {},
      detail: typeof error.detail === 'string' ? error.detail : null,
    }
  }

  // Already normalized media error
  if (
    typeof error === 'object' &&
    typeof error.code === 'string' &&
    Object.values(MEDIA_ERROR_CODES).includes(error.code)
  ) {
    return error
  }

  const response = error.response

  if (response) {
    const status = response.status
    const data = response.data

    if (status === 401) {
      return {
        code: MEDIA_ERROR_CODES.UNAUTHENTICATED,
        message: 'You must be logged in to modify post media.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 403) {
      return {
        code: MEDIA_ERROR_CODES.FORBIDDEN,
        message: 'Only the author can modify the featured image of this post.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 404) {
      return {
        code: MEDIA_ERROR_CODES.NOT_FOUND,
        message: 'The requested post was not found.',
        fieldErrors: {},
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status === 400) {
      const fieldErrors = {}
      let detailMessage = 'The uploaded image failed validation.'

      if (data && typeof data === 'object') {
        if (typeof data.detail === 'string') {
          detailMessage = data.detail
        } else if (Array.isArray(data.image)) {
          detailMessage = data.image.join(' ')
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
        code: MEDIA_ERROR_CODES.VALIDATION_ERROR,
        message: detailMessage,
        fieldErrors,
        detail: typeof data?.detail === 'string' ? data.detail : null,
      }
    }

    if (status >= 500) {
      return {
        code: MEDIA_ERROR_CODES.SERVER_ERROR,
        message: 'A server error occurred while processing the featured image.',
        fieldErrors: {},
        detail: null,
      }
    }
  }

  // Client validation / standard Error without HTTP response or network code
  if (
    error instanceof Error &&
    !error.response &&
    error.code !== 'ECONNABORTED' &&
    error.message !== 'Network Error' &&
    !error.message?.includes('Network Error')
  ) {
    return {
      code: MEDIA_ERROR_CODES.VALIDATION_ERROR,
      message: error.message || 'Validation error occurred.',
      fieldErrors: {},
      detail: null,
    }
  }

  // Network / timeout errors
  if (
    error.code === 'ECONNABORTED' ||
    error.message?.includes('Network Error') ||
    !response
  ) {
    return {
      code: MEDIA_ERROR_CODES.NETWORK_ERROR,
      message: 'Network connection error. Please check your connection and try again.',
      fieldErrors: {},
      detail: null,
    }
  }

  return {
    code: MEDIA_ERROR_CODES.UNKNOWN_ERROR,
    message: typeof error.message === 'string' ? error.message : 'An unexpected media error occurred.',
    fieldErrors: {},
    detail: null,
  }
}
