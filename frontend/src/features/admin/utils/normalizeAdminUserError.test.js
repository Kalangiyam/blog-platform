import { describe, expect, it } from 'vitest'

import {
  ADMIN_USER_ERROR_CODES,
  normalizeAdminUserError,
} from './normalizeAdminUserError.js'

describe('normalizeAdminUserError', () => {
  it('returns UNKNOWN_ERROR for null or empty input', () => {
    const result = normalizeAdminUserError(null)
    expect(result.code).toBe(ADMIN_USER_ERROR_CODES.UNKNOWN_ERROR)
    expect(result.message).toContain('unexpected')
  })

  it('handles request cancellation', () => {
    const cancelErr = { name: 'CanceledError' }
    const result = normalizeAdminUserError(cancelErr)
    expect(result.code).toBe(ADMIN_USER_ERROR_CODES.CANCELLED)
  })

  it('normalizes 404 Not Found error', () => {
    const err = { response: { status: 404, data: { detail: 'User does not exist.' } } }
    const result = normalizeAdminUserError(err)
    expect(result.code).toBe(ADMIN_USER_ERROR_CODES.NOT_FOUND)
    expect(result.message).toBe('The requested user was not found.')
  })

  it('normalizes 401 Unauthenticated error', () => {
    const err = { response: { status: 401, data: { detail: 'Authentication credentials were not provided.' } } }
    const result = normalizeAdminUserError(err)
    expect(result.code).toBe(ADMIN_USER_ERROR_CODES.UNAUTHENTICATED)
  })

  it('normalizes 403 Forbidden error', () => {
    const err = { response: { status: 403, data: { detail: 'You do not have permission.' } } }
    const result = normalizeAdminUserError(err)
    expect(result.code).toBe(ADMIN_USER_ERROR_CODES.FORBIDDEN)
  })

  it('normalizes 400 Validation error with field errors', () => {
    const err = {
      response: {
        status: 400,
        data: {
          username: ['A user with that username already exists.'],
          email: ['A user with this email already exists.'],
          detail: 'Validation failed.',
        },
      },
    }
    const result = normalizeAdminUserError(err)
    expect(result.code).toBe(ADMIN_USER_ERROR_CODES.VALIDATION_ERROR)
    expect(result.message).toBe('Validation failed.')
    expect(result.fieldErrors.username).toEqual(['A user with that username already exists.'])
    expect(result.fieldErrors.email).toEqual(['A user with this email already exists.'])
  })

  it('normalizes 500 Server error', () => {
    const err = { response: { status: 500 } }
    const result = normalizeAdminUserError(err)
    expect(result.code).toBe(ADMIN_USER_ERROR_CODES.SERVER_ERROR)
  })

  it('normalizes Network connection error', () => {
    const err = { message: 'Network Error' }
    const result = normalizeAdminUserError(err)
    expect(result.code).toBe(ADMIN_USER_ERROR_CODES.NETWORK_ERROR)
  })
})
