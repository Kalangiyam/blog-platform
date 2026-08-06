import { isCommentOwner, isPostOwner } from './ownership.js'
import { isAdministrator, isAuthor, isEditor } from './roles.js'

/**
 * Checks if user can create a post.
 * Requires Author or Editor role.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canCreatePost(user) {
  if (!user) return false
  return isAuthor(user) || isEditor(user)
}

/**
 * Checks if user can edit a post.
 * Editors can edit any post; Authors can edit their own posts.
 * Matches backend IsPostAuthor DRF permission contract.
 *
 * @param {Object|null} user
 * @param {Object|null} post
 * @returns {boolean}
 */
export function canEditPost(user, post) {
  if (!user || !post) return false
  if (isEditor(user)) return true
  return isPostOwner(user, post)
}

/**
 * Checks if user can delete a post.
 * Editors can delete any post; Authors can delete their own posts.
 * Matches backend IsPostAuthor DRF permission contract.
 *
 * @param {Object|null} user
 * @param {Object|null} post
 * @returns {boolean}
 */
export function canDeletePost(user, post) {
  if (!user || !post) return false
  if (isEditor(user)) return true
  return isPostOwner(user, post)
}

/**
 * Checks if user can publish a post.
 * Editors can publish any post; Authors can publish their own posts.
 * Matches backend IsPostAuthor DRF permission contract.
 *
 * @param {Object|null} user
 * @param {Object|null} post
 * @returns {boolean}
 */
export function canPublishPost(user, post) {
  if (!user || !post) return false
  if (isEditor(user)) return true
  return isPostOwner(user, post)
}

/**
 * Checks if user can unpublish a post.
 * Editors can unpublish any post; Authors can unpublish their own posts.
 * Matches backend IsPostAuthor DRF permission contract.
 *
 * @param {Object|null} user
 * @param {Object|null} post
 * @returns {boolean}
 */
export function canUnpublishPost(user, post) {
  if (!user || !post) return false
  if (isEditor(user)) return true
  return isPostOwner(user, post)
}

/**
 * Checks if user can manage (upload, replace, remove) featured image on a post.
 * Editors can manage featured image on any post; Authors on their own posts.
 * Matches backend IsPostAuthor DRF permission contract.
 *
 * @param {Object|null} user
 * @param {Object|null} post
 * @returns {boolean}
 */
export function canManageFeaturedImage(user, post) {
  if (!user || !post) return false
  if (isEditor(user)) return true
  return isPostOwner(user, post)
}

/**
 * Checks if user can create a comment.
 * Requires any authenticated user.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canCreateComment(user) {
  return Boolean(user)
}

/**
 * Checks if user can edit a comment.
 * Requires comment author.
 * Matches backend IsCommentAuthor DRF permission contract.
 *
 * @param {Object|null} user
 * @param {Object|null} comment
 * @returns {boolean}
 */
export function canEditComment(user, comment) {
  if (!user || !comment) return false
  return isCommentOwner(user, comment)
}

/**
 * Checks if user can delete a comment.
 * Requires comment author.
 * Matches backend IsCommentAuthor DRF permission contract.
 *
 * @param {Object|null} user
 * @param {Object|null} comment
 * @returns {boolean}
 */
export function canDeleteComment(user, comment) {
  if (!user || !comment) return false
  return isCommentOwner(user, comment)
}

/**
 * Checks if user can moderate comments.
 * Requires Editor role.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canModerateComment(user) {
  if (!user) return false
  return isEditor(user)
}

/**
 * Checks if user can manage categories.
 * Requires Editor role.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canManageCategories(user) {
  if (!user) return false
  return isEditor(user)
}

/**
 * Checks if user can manage tags.
 * Requires Editor role.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canManageTags(user) {
  if (!user) return false
  return isEditor(user)
}

/**
 * Checks if user can view user administration.
 * Requires Administrator role.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canViewUserAdministration(user) {
  if (!user) return false
  return isAdministrator(user)
}

/**
 * Checks if user can manage users (activate/deactivate/roles).
 * Requires Administrator role.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canManageUsers(user) {
  if (!user) return false
  return isAdministrator(user)
}
