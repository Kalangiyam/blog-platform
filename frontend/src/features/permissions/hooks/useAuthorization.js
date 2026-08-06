import { useCallback, useMemo } from 'react'

import { AUTH_STATUS } from '../../auth/context/AuthContext.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { APPLICATION_ROLES } from '../permissions.constants.js'
import * as rules from '../utils/authorizationRules.js'
import * as ownership from '../utils/ownership.js'
import * as roleUtils from '../utils/roles.js'

/**
 * Custom hook providing a unified authorization interface.
 * Consumes authentication context and exposes helper functions for role checks,
 * ownership evaluations, and domain-level authorization rules.
 */
export function useAuthorization() {
  const { user, status, isAuthenticated, hasRole: contextHasRole, hasAnyRole: contextHasAnyRole } = useAuth()
  const isChecking = status === AUTH_STATUS.CHECKING

  const checkHasRole = useCallback(
    (role) => {
      if (typeof contextHasRole === 'function' && contextHasRole(role)) {
        return true
      }
      return roleUtils.hasRole(user, role)
    },
    [contextHasRole, user],
  )

  const checkHasAnyRole = useCallback(
    (requiredRoles) => {
      if (typeof contextHasAnyRole === 'function' && contextHasAnyRole(requiredRoles)) {
        return true
      }
      return roleUtils.hasAnyRole(user, requiredRoles)
    },
    [contextHasAnyRole, user],
  )

  const checkHasAllRoles = useCallback(
    (requiredRoles) => roleUtils.hasAllRoles(user, requiredRoles),
    [user],
  )

  const checkIsResourceOwner = useCallback(
    (resource, ownerField) => ownership.isResourceOwner(user, resource, ownerField),
    [user],
  )
  const checkIsPostOwner = useCallback(
    (post) => ownership.isPostOwner(user, post),
    [user],
  )
  const checkIsCommentOwner = useCallback(
    (comment) => ownership.isCommentOwner(user, comment),
    [user],
  )
  const checkIsProfileOwner = useCallback(
    (profile) => ownership.isProfileOwner(user, profile),
    [user],
  )

  const isAuthor = checkHasRole(APPLICATION_ROLES.AUTHOR)
  const isEditor = checkHasRole(APPLICATION_ROLES.EDITOR)
  const isAdministrator = checkHasRole(APPLICATION_ROLES.ADMINISTRATOR)

  // Evaluate domain rules, checking roles via context-aware checks
  const canCreatePost = useCallback(
    () => isAuthor || isEditor || rules.canCreatePost(user),
    [isAuthor, isEditor, user],
  )
  const canEditPost = useCallback(
    (post) => isEditor || rules.canEditPost(user, post),
    [isEditor, user],
  )
  const canDeletePost = useCallback(
    (post) => isEditor || rules.canDeletePost(user, post),
    [isEditor, user],
  )
  const canPublishPost = useCallback(
    (post) => isEditor || rules.canPublishPost(user, post),
    [isEditor, user],
  )
  const canUnpublishPost = useCallback(
    (post) => isEditor || rules.canUnpublishPost(user, post),
    [isEditor, user],
  )
  const canManageFeaturedImage = useCallback(
    (post) => isEditor || rules.canManageFeaturedImage(user, post),
    [isEditor, user],
  )

  const canCreateComment = useCallback(() => rules.canCreateComment(user), [user])
  const canEditComment = useCallback(
    (comment) => rules.canEditComment(user, comment),
    [user],
  )
  const canDeleteComment = useCallback(
    (comment) => rules.canDeleteComment(user, comment),
    [user],
  )
  const canModerateComment = useCallback(() => isEditor || rules.canModerateComment(user), [isEditor, user])

  const canManageCategories = useCallback(() => isEditor || rules.canManageCategories(user), [isEditor, user])
  const canManageTags = useCallback(() => isEditor || rules.canManageTags(user), [isEditor, user])
  const canViewUserAdministration = useCallback(
    () => isAdministrator || rules.canViewUserAdministration(user),
    [isAdministrator, user],
  )
  const canManageUsers = useCallback(() => isAdministrator || rules.canManageUsers(user), [isAdministrator, user])

  return useMemo(
    () => ({
      user,
      status,
      isAuthenticated,
      isChecking,

      // Role indicators
      isAuthor,
      isEditor,
      isAdministrator,

      // Role check functions
      hasRole: checkHasRole,
      hasAnyRole: checkHasAnyRole,
      hasAllRoles: checkHasAllRoles,

      // Ownership helpers
      isResourceOwner: checkIsResourceOwner,
      isPostOwner: checkIsPostOwner,
      isCommentOwner: checkIsCommentOwner,
      isProfileOwner: checkIsProfileOwner,

      // Domain authorization rules
      canCreatePost,
      canEditPost,
      canDeletePost,
      canPublishPost,
      canUnpublishPost,
      canManageFeaturedImage,
      canCreateComment,
      canEditComment,
      canDeleteComment,
      canModerateComment,
      canManageCategories,
      canManageTags,
      canViewUserAdministration,
      canManageUsers,
    }),
    [
      user,
      status,
      isAuthenticated,
      isChecking,
      isAuthor,
      isEditor,
      isAdministrator,
      checkHasRole,
      checkHasAnyRole,
      checkHasAllRoles,
      checkIsResourceOwner,
      checkIsPostOwner,
      checkIsCommentOwner,
      checkIsProfileOwner,
      canCreatePost,
      canEditPost,
      canDeletePost,
      canPublishPost,
      canUnpublishPost,
      canManageFeaturedImage,
      canCreateComment,
      canEditComment,
      canDeleteComment,
      canModerateComment,
      canManageCategories,
      canManageTags,
      canViewUserAdministration,
      canManageUsers,
    ],
  )
}
