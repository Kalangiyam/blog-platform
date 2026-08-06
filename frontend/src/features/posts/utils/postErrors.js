import axios from 'axios'

export const POST_ERROR_CODES = Object.freeze({
  CANCELLED: 'cancelled',
  NETWORK: 'network',
  NOT_FOUND: 'post_not_found',
  INVALID_PAGE: 'invalid_page',
  CLIENT: 'client',
  SERVER: 'server',
})

export class PostError extends Error {
  constructor(code) {
    super('The public-post request could not be completed.')
    this.name = 'PostError'
    this.code = code
  }
}

export function normalizePostError(error, operation = 'list') {
  if (error instanceof PostError) {
    return error
  }

  if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
    return new PostError(POST_ERROR_CODES.CANCELLED)
  }

  if (!error?.response) {
    return new PostError(POST_ERROR_CODES.NETWORK)
  }

  const status = error.response.status

  if (status === 404) {
    return new PostError(
      operation === 'detail'
        ? POST_ERROR_CODES.NOT_FOUND
        : POST_ERROR_CODES.INVALID_PAGE,
    )
  }

  if (status >= 500) {
    return new PostError(POST_ERROR_CODES.SERVER)
  }

  return new PostError(POST_ERROR_CODES.CLIENT)
}
