/**
 * Safely compares two entity identifiers (number or string).
 * Performs numeric comparison when both can be parsed as numbers,
 * otherwise performs exact string comparison.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function safeIdCompare(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return false
  }

  const numA = Number(a)
  const numB = Number(b)

  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return numA === numB
  }

  return String(a).trim() === String(b).trim()
}

/**
 * Generic utility to check if an authenticated user owns a given resource.
 * Compares user ID against owner ID or username against owner username.
 *
 * @param {Object|null} user - Authenticated user object
 * @param {Object|null} resource - Resource object (Post, Comment, Profile, etc.)
 * @param {string} [ownerField='author'] - Field on resource representing the owner
 * @returns {boolean}
 */
export function isResourceOwner(user, resource, ownerField = 'author') {
  if (!user || !resource || typeof user !== 'object' || typeof resource !== 'object') {
    return false
  }

  const owner = resource[ownerField] || (ownerField === 'user' ? resource : null)
  const ownerObj = typeof owner === 'object' && owner !== null ? owner : null

  // 1. Compare user ID with resource owner ID
  const userId = user.id
  const ownerId = ownerObj ? ownerObj.id : (typeof owner === 'number' || typeof owner === 'string' ? owner : null)

  if (userId !== undefined && userId !== null && ownerId !== undefined && ownerId !== null) {
    if (safeIdCompare(userId, ownerId)) {
      return true
    }
  }

  // 2. Fallback: Compare username
  const username = user.username
  const ownerUsername = ownerObj ? ownerObj.username : null

  if (
    typeof username === 'string' &&
    username.trim().length > 0 &&
    typeof ownerUsername === 'string' &&
    ownerUsername.trim().length > 0
  ) {
    return username.trim() === ownerUsername.trim()
  }

  return false
}

/**
 * Semantic helper: Checks whether user is the author/owner of a post.
 *
 * @param {Object|null} user
 * @param {Object|null} post
 * @returns {boolean}
 */
export function isPostOwner(user, post) {
  return isResourceOwner(user, post, 'author')
}

/**
 * Semantic helper: Checks whether user is the author/owner of a comment.
 *
 * @param {Object|null} user
 * @param {Object|null} comment
 * @returns {boolean}
 */
export function isCommentOwner(user, comment) {
  return isResourceOwner(user, comment, 'author')
}

/**
 * Semantic helper: Checks whether user is the owner of a profile.
 *
 * @param {Object|null} user
 * @param {Object|null} profile
 * @returns {boolean}
 */
export function isProfileOwner(user, profile) {
  if (!user || !profile) {
    return false
  }

  // Compare profile user ID/username against user
  if (profile.user) {
    return isResourceOwner(user, profile, 'user')
  }

  // If profile object itself has id or username
  return isResourceOwner(user, { author: profile }, 'author')
}
