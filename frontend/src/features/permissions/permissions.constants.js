/**
 * Application role names recognized by the backend contract.
 * Role names are case-sensitive strings matching Django groups.
 */
export const APPLICATION_ROLES = Object.freeze({
  AUTHOR: 'Author',
  EDITOR: 'Editor',
  ADMINISTRATOR: 'Administrator',
})

/**
 * Domain action constants for granular permission checking.
 */
export const PERMISSION_ACTIONS = Object.freeze({
  POST_CREATE: 'post.create',
  POST_EDIT: 'post.edit',
  POST_DELETE: 'post.delete',
  POST_PUBLISH: 'post.publish',
  POST_UNPUBLISH: 'post.unpublish',
  FEATURED_IMAGE_MANAGE: 'featured_image.manage',
  COMMENT_CREATE: 'comment.create',
  COMMENT_EDIT: 'comment.edit',
  COMMENT_DELETE: 'comment.delete',
  COMMENT_MODERATE: 'comment.moderate',
  CATEGORY_MANAGE: 'category.manage',
  TAG_MANAGE: 'tag.manage',
  USER_MANAGE: 'user.manage',
  ADMINISTRATION_VIEW: 'administration.view',
})
