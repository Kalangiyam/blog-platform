import { useCallback } from 'react'

import { useAuth } from '../../auth/hooks/useAuth.js'
import { isCommentOwner, isPostOwner, isProfileOwner, isResourceOwner } from '../utils/ownership.js'

/**
 * Custom hook to evaluate ownership of a resource for the authenticated user.
 *
 * @returns {Object} Ownership utility methods bound to the current user
 */
export function useOwnership() {
  const { user } = useAuth()

  const checkIsResourceOwner = useCallback(
    (resource, ownerField) => isResourceOwner(user, resource, ownerField),
    [user],
  )

  const checkIsPostOwner = useCallback(
    (post) => isPostOwner(user, post),
    [user],
  )

  const checkIsCommentOwner = useCallback(
    (comment) => isCommentOwner(user, comment),
    [user],
  )

  const checkIsProfileOwner = useCallback(
    (profile) => isProfileOwner(user, profile),
    [user],
  )

  return {
    isResourceOwner: checkIsResourceOwner,
    isPostOwner: checkIsPostOwner,
    isCommentOwner: checkIsCommentOwner,
    isProfileOwner: checkIsProfileOwner,
  }
}
