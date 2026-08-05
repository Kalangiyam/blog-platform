import axios, { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'

import {
  AUTH_ERROR_CODES,
  AuthError,
  createAuthError,
  normalizeAuthError,
} from './authErrors.js'

function createAxiosError({
  code,
  status,
  data,
  requestData = { refresh: 'request-refresh-secret' },
} = {}) {
  const config = {
    data: JSON.stringify(requestData),
    headers: {
      Authorization: 'Bearer request-access-secret',
    },
  }
  const response = status
    ? {
        status,
        statusText: 'Request failed',
        data,
        headers: {},
        config,
      }
    : undefined

  return new AxiosError(
    'Axios request failed',
    code,
    config,
    {},
    response,
  )
}

describe('normalizeAuthError', () => {
  it('maps the exact login credential rejection without exposing Axios data', () => {
    const normalized = normalizeAuthError(
      createAxiosError({
        status: 400,
        data: {
          non_field_errors: ['Invalid email or password.'],
        },
      }),
      'login',
    )

    expect(normalized).toBeInstanceOf(AuthError)
    expect(normalized).toMatchObject({
      code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      status: 400,
      fieldErrors: null,
    })
    expect(normalized).not.toHaveProperty('config')
    expect(normalized).not.toHaveProperty('request')
    expect(normalized).not.toHaveProperty('response')
    expect(JSON.stringify(normalized)).not.toContain('request-access-secret')
    expect(JSON.stringify(normalized)).not.toContain('request-refresh-secret')
    expect(normalized.toJSON()).not.toHaveProperty('stack')
  })

  it('normalizes only recognized field-validation messages', () => {
    const normalized = normalizeAuthError(
      createAxiosError({
        status: 400,
        data: {
          email: ['Enter a valid email address.'],
          password: 'This field is required.',
          internal_debug: ['Database serializer detail'],
        },
      }),
      'login',
    )

    expect(normalized.code).toBe(AUTH_ERROR_CODES.VALIDATION)
    expect(normalized.fieldErrors).toEqual({
      email: ['Enter a valid email address.'],
      password: ['This field is required.'],
    })
    expect(JSON.stringify(normalized)).not.toContain('Database serializer')
  })

  it.each(['ECONNABORTED', 'ETIMEDOUT'])(
    'maps Axios %s failures to a request timeout',
    (code) => {
      const normalized = normalizeAuthError(createAxiosError({ code }), 'login')

      expect(normalized).toMatchObject({
        code: AUTH_ERROR_CODES.TIMEOUT,
        status: null,
      })
    },
  )

  it('maps an HTTP 408 response to a request timeout', () => {
    const normalized = normalizeAuthError(
      createAxiosError({ status: 408, data: {} }),
      'current-user',
    )

    expect(normalized).toMatchObject({
      code: AUTH_ERROR_CODES.TIMEOUT,
      status: 408,
    })
  })

  it('maps an Axios failure without a response to a network error', () => {
    const normalized = normalizeAuthError(
      createAxiosError({ code: AxiosError.ERR_NETWORK }),
      'current-user',
    )

    expect(normalized).toMatchObject({
      code: AUTH_ERROR_CODES.NETWORK,
      status: null,
    })
  })

  it('maps unauthorized and expired-token responses to unauthorized', () => {
    const normalized = normalizeAuthError(
      createAxiosError({
        status: 401,
        data: {
          detail: 'Token is invalid or expired',
          code: 'token_not_valid',
        },
      }),
      'current-user',
    )

    expect(normalized).toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
      status: 401,
    })
    expect(normalized.message).not.toContain('token_not_valid')
  })

  it('maps the logout and refresh 400 rejection contract to unauthorized', () => {
    const normalized = normalizeAuthError(
      createAxiosError({
        status: 400,
        data: {
          refresh: ['Invalid or expired refresh token.'],
        },
      }),
      'refresh',
    )

    expect(normalized).toMatchObject({
      code: AUTH_ERROR_CODES.UNAUTHORIZED,
      status: 400,
    })
  })

  it('maps 5xx responses to a safe server error', () => {
    const normalized = normalizeAuthError(
      createAxiosError({
        status: 503,
        data: { detail: 'Internal database connection detail' },
      }),
      'login',
    )

    expect(normalized).toMatchObject({
      code: AUTH_ERROR_CODES.SERVER,
      status: 503,
    })
    expect(JSON.stringify(normalized)).not.toContain('database connection')
  })

  it('maps non-Axios failures to an unexpected safe error', () => {
    const normalized = normalizeAuthError(
      new Error('Internal implementation detail'),
      'login',
    )

    expect(normalized).toMatchObject({
      code: AUTH_ERROR_CODES.UNEXPECTED,
      status: null,
    })
    expect(normalized.message).not.toContain('Internal implementation detail')
  })

  it('preserves an already-normalized authentication error', () => {
    const existing = createAuthError(AUTH_ERROR_CODES.STORAGE_UNAVAILABLE)

    expect(normalizeAuthError(existing, 'login')).toBe(existing)
  })

  it('uses Axios error detection rather than leaking raw response objects', () => {
    const rawError = createAxiosError({ status: 500, data: {} })

    expect(axios.isAxiosError(rawError)).toBe(true)
    expect(normalizeAuthError(rawError, 'login')).toBeInstanceOf(AuthError)
  })
})
