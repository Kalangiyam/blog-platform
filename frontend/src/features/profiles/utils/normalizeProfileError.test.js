import { describe, expect, it } from 'vitest'
import {
  PROFILE_ERROR_CODES,
  normalizeProfileError,
} from './normalizeProfileError.js'

describe('normalizeProfileError', () => {
  it('handles null/undefined error', () => {
    const err = normalizeProfileError(null)
    expect(err.code).toBe(PROFILE_ERROR_CODES.UNKNOWN_ERROR)
  })

  it('normalizes 404 response', () => {
    const error = {
      response: {
        status: 404,
        data: { detail: 'Profile not found' },
      },
    }
    const normalized = normalizeProfileError(error)
    expect(normalized.code).toBe(PROFILE_ERROR_CODES.NOT_FOUND)
    expect(normalized.detail).toBe('Profile not found')
  })

  it('normalizes 401 response', () => {
    const error = { response: { status: 401 } }
    const normalized = normalizeProfileError(error)
    expect(normalized.code).toBe(PROFILE_ERROR_CODES.UNAUTHENTICATED)
  })

  it('normalizes 400 validation error with field errors', () => {
    const error = {
      response: {
        status: 400,
        data: {
          bio: ['Ensure this field has no more than 500 characters.'],
          website: ['Enter a valid URL.'],
        },
      },
    }
    const normalized = normalizeProfileError(error)
    expect(normalized.code).toBe(PROFILE_ERROR_CODES.VALIDATION_ERROR)
    expect(normalized.fieldErrors.bio).toEqual(['Ensure this field has no more than 500 characters.'])
    expect(normalized.fieldErrors.website).toEqual(['Enter a valid URL.'])
  })

  it('normalizes 500 server error', () => {
    const error = { response: { status: 500 } }
    const normalized = normalizeProfileError(error)
    expect(normalized.code).toBe(PROFILE_ERROR_CODES.SERVER_ERROR)
  })

  it('normalizes network errors', () => {
    const error = { message: 'Network Error' }
    const normalized = normalizeProfileError(error)
    expect(normalized.code).toBe(PROFILE_ERROR_CODES.NETWORK_ERROR)
  })

  it('normalizes cancelled requests', () => {
    const error = { name: 'CanceledError' }
    const normalized = normalizeProfileError(error)
    expect(normalized.code).toBe(PROFILE_ERROR_CODES.CANCELLED)
  })
})
