import { isSafeProfileUrl } from './safeProfileUrl.js'

export const ALLOWED_PROFILE_UPDATE_FIELDS = Object.freeze([
  'bio',
  'website',
  'location',
  'date_of_birth',
])

export const PROFILE_FIELD_LIMITS = Object.freeze({
  BIO_MAX_LENGTH: 500,
  LOCATION_MAX_LENGTH: 100,
})

/**
 * Returns today's local date in YYYY-MM-DD format.
 */
export function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Compares current form values against baseline profile data, returning
 * an object with only changed allowlisted fields for PATCH requests.
 *
 * @param {Record<string, any>} currentValues
 * @param {Record<string, any>} baselineData
 * @returns {Record<string, any>}
 */
export function getChangedProfileFields(currentValues = {}, baselineData = {}) {
  const payload = {}

  for (const field of ALLOWED_PROFILE_UPDATE_FIELDS) {
    if (!(field in currentValues)) {
      continue
    }

    let currentValue = currentValues[field]
    let baselineValue = baselineData[field]

    // Normalize empty strings vs null for date_of_birth
    if (field === 'date_of_birth') {
      currentValue = currentValue === '' ? null : currentValue
      baselineValue = baselineValue === '' ? null : (baselineValue ?? null)
    } else {
      currentValue = typeof currentValue === 'string' ? currentValue.trim() : (currentValue ?? '')
      baselineValue = typeof baselineValue === 'string' ? baselineValue.trim() : (baselineValue ?? '')
    }

    if (currentValue !== baselineValue) {
      payload[field] = currentValue
    }
  }

  return payload
}

/**
 * Validates profile edit form values on the client side.
 *
 * @param {Record<string, any>} values
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateProfileForm(values = {}) {
  const errors = {}

  // Bio validation
  if (typeof values.bio === 'string' && values.bio.length > PROFILE_FIELD_LIMITS.BIO_MAX_LENGTH) {
    errors.bio = `Biography cannot exceed ${PROFILE_FIELD_LIMITS.BIO_MAX_LENGTH} characters.`
  }

  // Location validation
  if (typeof values.location === 'string' && values.location.length > PROFILE_FIELD_LIMITS.LOCATION_MAX_LENGTH) {
    errors.location = `Location cannot exceed ${PROFILE_FIELD_LIMITS.LOCATION_MAX_LENGTH} characters.`
  }

  // Website validation
  if (typeof values.website === 'string' && values.website.trim().length > 0) {
    if (!isSafeProfileUrl(values.website)) {
      errors.website = 'Please enter a valid website URL starting with http:// or https://'
    }
  }

  // Date of birth validation
  if (typeof values.date_of_birth === 'string' && values.date_of_birth.trim().length > 0) {
    const dobString = values.date_of_birth.trim()
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

    if (!isoDatePattern.test(dobString)) {
      errors.date_of_birth = 'Date of birth must be in YYYY-MM-DD format.'
    } else {
      const today = getTodayDateString()
      if (dobString > today) {
        errors.date_of_birth = 'Date of birth cannot be in the future.'
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
