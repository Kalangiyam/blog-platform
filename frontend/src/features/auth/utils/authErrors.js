import axios from 'axios'

export const AUTH_ERROR_CODES = Object.freeze({
  INVALID_CREDENTIALS: 'invalid_credentials',
  VALIDATION: 'validation_error',
  NETWORK: 'network_error',
  TIMEOUT: 'request_timeout',
  UNAUTHORIZED: 'unauthorized',
  SERVER: 'server_error',
  STORAGE_UNAVAILABLE: 'storage_unavailable',
  UNEXPECTED: 'unexpected_error',
})

const ERROR_MESSAGES = Object.freeze({
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]:
    'The email or password is incorrect.',
  [AUTH_ERROR_CODES.VALIDATION]:
    'Check the submitted authentication fields.',
  [AUTH_ERROR_CODES.NETWORK]:
    'The authentication service could not be reached.',
  [AUTH_ERROR_CODES.TIMEOUT]:
    'The authentication request timed out.',
  [AUTH_ERROR_CODES.UNAUTHORIZED]:
    'The authentication session is invalid or has expired.',
  [AUTH_ERROR_CODES.SERVER]:
    'The authentication service is temporarily unavailable.',
  [AUTH_ERROR_CODES.STORAGE_UNAVAILABLE]:
    'Browser storage is unavailable, so authentication cannot continue.',
  [AUTH_ERROR_CODES.UNEXPECTED]:
    'The authentication request could not be completed.',
})

const VALIDATION_FIELDS = Object.freeze([
  'email',
  'password',
  'refresh',
  'token',
])

export class AuthError extends Error {
  constructor(code, { status = null, fieldErrors = null } = {}) {
    super(ERROR_MESSAGES[code] ?? ERROR_MESSAGES[AUTH_ERROR_CODES.UNEXPECTED])
    this.name = 'AuthError'
    this.code = code
    this.status = status
    this.fieldErrors = fieldErrors
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      status: this.status,
      fieldErrors: this.fieldErrors,
    }
  }
}

export function createAuthError(code, options) {
  return new AuthError(code, options)
}

function getStringMessages(value) {
  const messages = Array.isArray(value) ? value : [value]

  return messages.filter((message) => typeof message === 'string')
}

function getFieldErrors(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null
  }

  const fieldErrors = {}

  for (const field of VALIDATION_FIELDS) {
    const messages = getStringMessages(data[field])

    if (messages.length > 0) {
      fieldErrors[field] = messages
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null
}

function isInvalidCredentialsResponse(data) {
  return getStringMessages(data?.non_field_errors).some(
    (message) => message === 'Invalid email or password.',
  )
}

function isRejectedRefreshResponse(data) {
  return getStringMessages(data?.refresh).some((message) => {
    const normalizedMessage = message.toLowerCase()

    return (
      normalizedMessage.includes('invalid') ||
      normalizedMessage.includes('expired') ||
      normalizedMessage.includes('blacklist')
    )
  })
}

export function normalizeAuthError(error, operation) {
  if (error instanceof AuthError) {
    return error
  }

  if (!axios.isAxiosError(error)) {
    return createAuthError(AUTH_ERROR_CODES.UNEXPECTED)
  }

  if (
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT' ||
    error.response?.status === 408
  ) {
    return createAuthError(AUTH_ERROR_CODES.TIMEOUT, {
      status: error.response?.status ?? null,
    })
  }

  if (!error.response) {
    return createAuthError(AUTH_ERROR_CODES.NETWORK)
  }

  const { data, status } = error.response

  if (
    operation === 'login' &&
    status === 400 &&
    isInvalidCredentialsResponse(data)
  ) {
    return createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS, { status })
  }

  if (
    (operation === 'refresh' || operation === 'logout') &&
    status === 400 &&
    isRejectedRefreshResponse(data)
  ) {
    return createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED, { status })
  }

  if (status === 400) {
    return createAuthError(AUTH_ERROR_CODES.VALIDATION, {
      status,
      fieldErrors: getFieldErrors(data),
    })
  }

  if (status === 401) {
    return createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED, { status })
  }

  if (status >= 500) {
    return createAuthError(AUTH_ERROR_CODES.SERVER, { status })
  }

  return createAuthError(AUTH_ERROR_CODES.UNEXPECTED, { status })
}
