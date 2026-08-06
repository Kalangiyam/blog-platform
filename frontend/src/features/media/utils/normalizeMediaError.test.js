import { describe, expect, it } from 'vitest'

import {
  MEDIA_ERROR_CODES,
  normalizeMediaError,
} from './normalizeMediaError.js'

describe('normalizeMediaError', () => {
  it('normalizes cancellation errors', () => {
    const error = new Error('Canceled')
    error.name = 'CanceledError'
    const normalized = normalizeMediaError(error)
    expect(normalized.code).toBe(MEDIA_ERROR_CODES.CANCELLED)
    expect(normalized.message).toBe('Media upload or operation was cancelled.')
  })

  it('normalizes 401 unauthorized errors', () => {
    const error = {
      response: {
        status: 401,
        data: { detail: 'Authentication credentials were not provided.' },
      },
    }
    const normalized = normalizeMediaError(error)
    expect(normalized.code).toBe(MEDIA_ERROR_CODES.UNAUTHENTICATED)
    expect(normalized.detail).toBe('Authentication credentials were not provided.')
  })

  it('normalizes 403 forbidden errors', () => {
    const error = {
      response: {
        status: 403,
        data: { detail: 'You do not have permission to perform this action.' },
      },
    }
    const normalized = normalizeMediaError(error)
    expect(normalized.code).toBe(MEDIA_ERROR_CODES.FORBIDDEN)
    expect(normalized.message).toBe('Only the author can modify the featured image of this post.')
  })

  it('normalizes 400 validation errors', () => {
    const error = {
      response: {
        status: 400,
        data: {
          image: ['Image size must not exceed 5 MB.'],
        },
      },
    }
    const normalized = normalizeMediaError(error)
    expect(normalized.code).toBe(MEDIA_ERROR_CODES.VALIDATION_ERROR)
    expect(normalized.message).toBe('Image size must not exceed 5 MB.')
    expect(normalized.fieldErrors.image).toEqual(['Image size must not exceed 5 MB.'])
  })

  it('normalizes 500 server errors safely without leaking internal secrets', () => {
    const error = {
      response: {
        status: 500,
        data: 'Internal Server Error traceback data',
      },
    }
    const normalized = normalizeMediaError(error)
    expect(normalized.code).toBe(MEDIA_ERROR_CODES.SERVER_ERROR)
    expect(normalized.message).toBe('A server error occurred while processing the featured image.')
    expect(normalized.detail).toBeNull()
  })

  it('normalizes network errors when response is absent', () => {
    const error = new Error('Network Error')
    const normalized = normalizeMediaError(error)
    expect(normalized.code).toBe(MEDIA_ERROR_CODES.NETWORK_ERROR)
    expect(normalized.message).toBe('Network connection error. Please check your connection and try again.')
  })
})
