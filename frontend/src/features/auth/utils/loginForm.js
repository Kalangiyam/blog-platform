import { AUTH_ERROR_CODES } from './authErrors.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LOGIN_ERROR_MESSAGES = Object.freeze({
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [AUTH_ERROR_CODES.VALIDATION]:
    'Check the highlighted fields and try again.',
  [AUTH_ERROR_CODES.NETWORK]:
    'Unable to reach the server. Check your connection and try again.',
  [AUTH_ERROR_CODES.TIMEOUT]:
    'The request took too long. Please try again.',
  [AUTH_ERROR_CODES.UNAUTHORIZED]:
    'Your session could not be established. Please sign in again.',
  [AUTH_ERROR_CODES.SERVER]:
    'The authentication service is temporarily unavailable.',
  [AUTH_ERROR_CODES.STORAGE_UNAVAILABLE]:
    'Your browser could not store the session securely.',
  [AUTH_ERROR_CODES.UNEXPECTED]:
    'Sign in could not be completed. Please try again.',
})

export function validateLoginFields({ email = '', password = '' } = {}) {
  const fieldErrors = {}
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    fieldErrors.email = 'Enter your email address.'
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    fieldErrors.email = 'Enter a valid email address.'
  }

  if (!password) {
    fieldErrors.password = 'Enter your password.'
  }

  return fieldErrors
}

export function getLoginFieldErrors(authError) {
  if (
    authError?.code !== AUTH_ERROR_CODES.VALIDATION ||
    !authError.fieldErrors ||
    typeof authError.fieldErrors !== 'object'
  ) {
    return {}
  }

  const fieldErrors = {}

  if (Array.isArray(authError.fieldErrors.email)) {
    fieldErrors.email = 'Enter a valid email address.'
  }

  if (Array.isArray(authError.fieldErrors.password)) {
    fieldErrors.password = 'Check the password and try again.'
  }

  return fieldErrors
}

export function getLoginErrorMessage(authError) {
  if (!authError) {
    return null
  }

  return (
    LOGIN_ERROR_MESSAGES[authError.code] ??
    LOGIN_ERROR_MESSAGES[AUTH_ERROR_CODES.UNEXPECTED]
  )
}
