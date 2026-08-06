import { apiClient } from '../../../lib/apiClient.js'
import { normalizeProfileError } from '../utils/normalizeProfileError.js'

/**
 * Fetch public profile details by username.
 *
 * Endpoint: GET /api/users/{username}/profile/
 *
 * @param {string} username
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ username: string, bio: string, website: string, location: string }>}
 */
export async function getPublicProfile(username, options = {}) {
  if (!username || typeof username !== 'string') {
    throw normalizeProfileError({
      response: {
        status: 404,
        data: { detail: 'Username is required.' },
      },
    })
  }

  try {
    const encodedUsername = encodeURIComponent(username.trim())
    const response = await apiClient.get(`/users/${encodedUsername}/profile/`, {
      signal: options.signal,
    })
    return response.data
  } catch (error) {
    throw normalizeProfileError(error)
  }
}

/**
 * Fetch current authenticated user's private profile details.
 *
 * Endpoint: GET /api/profile/
 *
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ username: string, email: string, bio: string, website: string, location: string, date_of_birth: string|null }>}
 */
export async function getCurrentProfile(options = {}) {
  try {
    const response = await apiClient.get('/profile/', {
      signal: options.signal,
    })
    return response.data
  } catch (error) {
    throw normalizeProfileError(error)
  }
}

/**
 * Partially update current authenticated user's profile.
 *
 * Endpoint: PATCH /api/profile/
 *
 * @param {Record<string, any>} patchPayload Writable fields (bio, website, location, date_of_birth)
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ username: string, email: string, bio: string, website: string, location: string, date_of_birth: string|null }>}
 */
export async function updateCurrentProfile(patchPayload, options = {}) {
  try {
    const response = await apiClient.patch('/profile/', patchPayload, {
      signal: options.signal,
    })
    return response.data
  } catch (error) {
    throw normalizeProfileError(error)
  }
}
