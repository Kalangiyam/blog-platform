import { APPLICATION_ROLES } from '../permissions.constants.js'

/**
 * Validates whether a given role is a non-empty string.
 *
 * @param {*} role
 * @returns {boolean}
 */
export function isValidRole(role) {
  return typeof role === 'string' && role.trim().length > 0
}

/**
 * Safely extracts valid role strings from a user object.
 * Returns null if user is invalid or roles array is missing/malformed.
 *
 * @param {Object|null} user
 * @returns {string[]|null}
 */
export function getValidUserRoles(user) {
  if (!user || typeof user !== 'object') {
    return null
  }

  const roles = user.roles
  if (!Array.isArray(roles) || !roles.every(isValidRole)) {
    return null
  }

  return roles
}

/**
 * Checks whether the user possesses a specific role.
 *
 * @param {Object|null} user
 * @param {string} role
 * @returns {boolean}
 */
export function hasRole(user, role) {
  const roles = getValidUserRoles(user)
  return roles !== null && isValidRole(role) && roles.includes(role)
}

/**
 * Checks whether the user possesses at least one of the specified roles.
 *
 * @param {Object|null} user
 * @param {string[]} requiredRoles
 * @returns {boolean}
 */
export function hasAnyRole(user, requiredRoles) {
  const roles = getValidUserRoles(user)
  if (
    roles === null ||
    !Array.isArray(requiredRoles) ||
    requiredRoles.length === 0 ||
    !requiredRoles.every(isValidRole)
  ) {
    return false
  }

  return requiredRoles.some((role) => roles.includes(role))
}

/**
 * Checks whether the user possesses all of the specified roles.
 *
 * @param {Object|null} user
 * @param {string[]} requiredRoles
 * @returns {boolean}
 */
export function hasAllRoles(user, requiredRoles) {
  const roles = getValidUserRoles(user)
  if (
    roles === null ||
    !Array.isArray(requiredRoles) ||
    requiredRoles.length === 0 ||
    !requiredRoles.every(isValidRole)
  ) {
    return false
  }

  return requiredRoles.every((role) => roles.includes(role))
}

/**
 * Semantic helper: Checks if user is an Author.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function isAuthor(user) {
  return hasRole(user, APPLICATION_ROLES.AUTHOR)
}

/**
 * Semantic helper: Checks if user is an Editor.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function isEditor(user) {
  return hasRole(user, APPLICATION_ROLES.EDITOR)
}

/**
 * Semantic helper: Checks if user is an Administrator.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function isAdministrator(user) {
  return hasRole(user, APPLICATION_ROLES.ADMINISTRATOR)
}
