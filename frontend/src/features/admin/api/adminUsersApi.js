import { apiClient } from '../../../lib/apiClient.js'
import { normalizeAdminUserError } from '../utils/normalizeAdminUserError.js'

export const ADMIN_USERS_PAGE_SIZE = 20

/**
 * Retrieves a paginated list of users for Administrators.
 *
 * @param {number} [page=1]
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ count: number, next: string|null, previous: string|null, results: Array }>}
 */
export async function getAdminUsers(page = 1, { signal } = {}) {
  try {
    const response = await apiClient.get('/admin/users/', {
      params: { page },
      signal,
    })

    return response.data
  } catch (error) {
    throw normalizeAdminUserError(error)
  }
}

/**
 * Retrieves detailed user information by ID for Administrators.
 *
 * @param {number|string} userId
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<Object>}
 */
export async function getAdminUserDetail(userId, { signal } = {}) {
  try {
    const response = await apiClient.get(
      `/admin/users/${encodeURIComponent(userId)}/`,
      { signal },
    )

    return response.data
  } catch (error) {
    throw normalizeAdminUserError(error)
  }
}

/**
 * Provisions a new user account as an Administrator.
 *
 * @param {Object} userData
 * @param {string} userData.username
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.password_confirm
 * @param {string} [userData.first_name]
 * @param {string} [userData.last_name]
 * @param {Array<string>} [userData.roles]
 * @returns {Promise<Object>}
 */
export async function createAdminUser(userData) {
  try {
    const response = await apiClient.post('/admin/users/', userData)
    return response.data
  } catch (error) {
    throw normalizeAdminUserError(error)
  }
}

/**
 * Activates a user account. Body is intentionally empty `{}`.
 *
 * @param {number|string} userId
 * @returns {Promise<Object>}
 */
export async function activateAdminUser(userId) {
  try {
    const response = await apiClient.post(
      `/admin/users/${encodeURIComponent(userId)}/activate/`,
      {},
    )
    return response.data
  } catch (error) {
    throw normalizeAdminUserError(error)
  }
}

/**
 * Deactivates a user account with backend safeguard enforcement. Body is empty `{}`.
 *
 * @param {number|string} userId
 * @returns {Promise<Object>}
 */
export async function deactivateAdminUser(userId) {
  try {
    const response = await apiClient.post(
      `/admin/users/${encodeURIComponent(userId)}/deactivate/`,
      {},
    )
    return response.data
  } catch (error) {
    throw normalizeAdminUserError(error)
  }
}

/**
 * Replaces a user's complete collection of application roles.
 *
 * @param {number|string} userId
 * @param {Array<string>} roles
 * @returns {Promise<Object>}
 */
export async function updateAdminUserRoles(userId, roles) {
  try {
    const response = await apiClient.put(
      `/admin/users/${encodeURIComponent(userId)}/roles/`,
      { roles },
    )
    return response.data
  } catch (error) {
    throw normalizeAdminUserError(error)
  }
}
