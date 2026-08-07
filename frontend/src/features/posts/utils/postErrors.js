import axios from 'axios'

export const POST_ERROR_CODES = Object.freeze({
  CANCELLED: 'cancelled',
  NETWORK: 'network',
  NOT_FOUND: 'post_not_found',
  INVALID_PAGE: 'invalid_page',
  CLIENT: 'client',
  SERVER: 'server',
  UNAUTHENTICATED: 'unauthenticated',
  FORBIDDEN: 'forbidden',
  VALIDATION_ERROR: 'validation_error',
})

export class PostError extends Error {
  constructor(
    code,
    message = 'The post request could not be completed.',
    fieldErrors = {},
    detail = null,
    status = null,
  ) {
    super(message)
    this.name = 'PostError'
    this.code = code
    this.fieldErrors = fieldErrors
    this.detail = detail
    this.status = status
  }
}

export function normalizePostError(error, operation = 'list') {
  if (error instanceof PostError) {
    return error
  }

  if (axios.isCancel(error) || error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
    return new PostError(POST_ERROR_CODES.CANCELLED, 'Post request was cancelled.')
  }

  if (error?.code === 'unauthorized') {
    return new PostError(
      POST_ERROR_CODES.UNAUTHENTICATED,
      'Your session has expired. Please log in again.',
      {},
      typeof error.detail === 'string' ? error.detail : null,
      401,
    )
  }

  if (!error?.response) {
    return new PostError(
      POST_ERROR_CODES.NETWORK,
      'Network connection error. Please check your connection and try again.',
    )
  }

  const response = error.response
  const status = response.status
  const data = response.data

  if (status === 404) {
    return new PostError(
      operation === 'detail'
        ? POST_ERROR_CODES.NOT_FOUND
        : POST_ERROR_CODES.INVALID_PAGE,
      'The requested post was not found.',
      {},
      typeof data?.detail === 'string' ? data.detail : null,
      404,
    )
  }

  if (status === 401) {
    return new PostError(
      POST_ERROR_CODES.UNAUTHENTICATED,
      'Authentication is required for this action.',
      {},
      typeof data?.detail === 'string' ? data.detail : null,
      401,
    )
  }

  if (status === 403) {
    return new PostError(
      POST_ERROR_CODES.FORBIDDEN,
      'You do not have permission to perform this action on this post.',
      {},
      typeof data?.detail === 'string' ? data.detail : null,
      403,
    )
  }

  if (status === 400) {
    const fieldErrors = {}
    let detailMessage = 'Please check the form for validation errors.'

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

    return new PostError(
      POST_ERROR_CODES.CLIENT,
      detailMessage,
      fieldErrors,
      typeof data?.detail === 'string' ? data.detail : null,
      400,
    )
  }

  if (status >= 500) {
    return new PostError(
      POST_ERROR_CODES.SERVER,
      'A server error occurred. Please try again later.',
      {},
      null,
      status,
    )
  }

  return new PostError(
    POST_ERROR_CODES.CLIENT,
    'An unexpected error occurred.',
    {},
    null,
    status,
  )
}

