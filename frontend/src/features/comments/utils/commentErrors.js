import axios from 'axios'

export const COMMENT_ERROR_CODES = Object.freeze({
  CANCELLED: 'cancelled',
  NETWORK: 'network',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  INVALID_PAGE: 'invalid_page',
  VALIDATION_ERROR: 'validation_error',
  SERVER: 'server',
  UNKNOWN: 'unknown',
})

export class CommentError extends Error {
  constructor(code, message, fields = null, rawStatus = null) {
    super(message || 'A comments request could not be completed.')
    this.name = 'CommentError'
    this.code = code
    this.fields = fields
    this.status = rawStatus
  }
}

export function normalizeCommentError(error, operation = 'list') {
  if (error instanceof CommentError) {
    return error
  }

  if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
    return new CommentError(
      COMMENT_ERROR_CODES.CANCELLED,
      'Request cancelled.',
    )
  }

  if (!error?.response) {
    return new CommentError(
      COMMENT_ERROR_CODES.NETWORK,
      'Unable to connect to the server. Please check your network connection.',
    )
  }

  const status = error.response.status
  const data = error.response.data

  if (status === 400) {
    const fields = typeof data === 'object' && data !== null ? data : null
    const message =
      fields?.detail ||
      (Array.isArray(fields?.non_field_errors)
        ? fields.non_field_errors[0]
        : 'Please correct the highlighted fields.')
    return new CommentError(
      COMMENT_ERROR_CODES.VALIDATION_ERROR,
      message,
      fields,
      status,
    )
  }

  if (status === 401) {
    return new CommentError(
      COMMENT_ERROR_CODES.UNAUTHORIZED,
      'You must be logged in to perform this action.',
      null,
      status,
    )
  }

  if (status === 403) {
    return new CommentError(
      COMMENT_ERROR_CODES.FORBIDDEN,
      'You do not have permission to perform this action.',
      null,
      status,
    )
  }

  if (status === 404) {
    return new CommentError(
      operation === 'list'
        ? COMMENT_ERROR_CODES.INVALID_PAGE
        : COMMENT_ERROR_CODES.NOT_FOUND,
      operation === 'list'
        ? 'The requested page of comments does not exist.'
        : 'The requested comment or post was not found.',
      null,
      status,
    )
  }

  if (status >= 500) {
    return new CommentError(
      COMMENT_ERROR_CODES.SERVER,
      'An unexpected server error occurred. Please try again later.',
      null,
      status,
    )
  }

  return new CommentError(
    COMMENT_ERROR_CODES.UNKNOWN,
    'An unexpected error occurred.',
    null,
    status,
  )
}
