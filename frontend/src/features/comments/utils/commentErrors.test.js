import { describe, expect, it } from 'vitest'

import {
  COMMENT_ERROR_CODES,
  CommentError,
  normalizeCommentError,
} from './commentErrors.js'

describe('normalizeCommentError', () => {
  it('returns CommentError instance as is', () => {
    const err = new CommentError(COMMENT_ERROR_CODES.FORBIDDEN, 'Forbidden')
    expect(normalizeCommentError(err)).toBe(err)
  })

  it('normalizes cancelled requests', () => {
    const cancelError = { code: 'ERR_CANCELED' }
    const result = normalizeCommentError(cancelError)
    expect(result.code).toBe(COMMENT_ERROR_CODES.CANCELLED)
  })

  it('normalizes network errors', () => {
    const networkError = {}
    const result = normalizeCommentError(networkError)
    expect(result.code).toBe(COMMENT_ERROR_CODES.NETWORK)
  })

  it('normalizes 400 validation error with field error data', () => {
    const error = {
      response: {
        status: 400,
        data: {
          content: ['Comment content cannot be empty.'],
        },
      },
    }
    const result = normalizeCommentError(error)
    expect(result.code).toBe(COMMENT_ERROR_CODES.VALIDATION_ERROR)
    expect(result.fields).toEqual({
      content: ['Comment content cannot be empty.'],
    })
  })

  it('normalizes 401 unauthorized error', () => {
    const error = { response: { status: 401 } }
    const result = normalizeCommentError(error)
    expect(result.code).toBe(COMMENT_ERROR_CODES.UNAUTHORIZED)
  })

  it('normalizes 403 forbidden error', () => {
    const error = { response: { status: 403 } }
    const result = normalizeCommentError(error)
    expect(result.code).toBe(COMMENT_ERROR_CODES.FORBIDDEN)
  })

  it('normalizes 404 for list vs other operations', () => {
    const error = { response: { status: 404 } }
    const listResult = normalizeCommentError(error, 'list')
    expect(listResult.code).toBe(COMMENT_ERROR_CODES.INVALID_PAGE)

    const detailResult = normalizeCommentError(error, 'delete')
    expect(detailResult.code).toBe(COMMENT_ERROR_CODES.NOT_FOUND)
  })

  it('normalizes 500 server error', () => {
    const error = { response: { status: 500 } }
    const result = normalizeCommentError(error)
    expect(result.code).toBe(COMMENT_ERROR_CODES.SERVER)
  })
})
