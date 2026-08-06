import { describe, expect, it } from 'vitest'

import {
  canCreateComment,
  canCreatePost,
  canDeleteComment,
  canDeletePost,
  canEditComment,
  canEditPost,
  canManageCategories,
  canManageFeaturedImage,
  canManageTags,
  canManageUsers,
  canModerateComment,
  canPublishPost,
  canUnpublishPost,
  canViewUserAdministration,
} from './authorizationRules.js'

describe('authorizationRules utility', () => {
  const authorA = { id: 1, username: 'author_a', roles: ['Author'] }
  const authorB = { id: 2, username: 'author_b', roles: ['Author'] }
  const editor = { id: 3, username: 'editor', roles: ['Editor'] }
  const admin = { id: 4, username: 'admin', roles: ['Administrator'] }
  const multiRole = {
    id: 5,
    username: 'multi',
    roles: ['Author', 'Editor', 'Administrator'],
  }
  const noRoleUser = { id: 6, username: 'norole', roles: [] }

  const postByAuthorA = { id: 10, title: 'Post 1', author: { id: 1, username: 'author_a' } }
  const commentByAuthorA = { id: 20, content: 'Comment 1', author: { id: 1, username: 'author_a' } }

  describe('Post Rules', () => {
    it('canCreatePost allows Author, Editor, multi-role but denies Anonymous, NoRole, Admin-only', () => {
      expect(canCreatePost(authorA)).toBe(true)
      expect(canCreatePost(editor)).toBe(true)
      expect(canCreatePost(multiRole)).toBe(true)

      expect(canCreatePost(null)).toBe(false)
      expect(canCreatePost(noRoleUser)).toBe(false)
      expect(canCreatePost(admin)).toBe(false)
    })

    it('canEditPost allows Editor on any post, Author on owned post, but denies Author on non-owned post', () => {
      expect(canEditPost(editor, postByAuthorA)).toBe(true)
      expect(canEditPost(authorA, postByAuthorA)).toBe(true)

      expect(canEditPost(authorB, postByAuthorA)).toBe(false)
      expect(canEditPost(admin, postByAuthorA)).toBe(false)
      expect(canEditPost(null, postByAuthorA)).toBe(false)
    })

    it('canDeletePost allows Editor on any post and Author on owned post', () => {
      expect(canDeletePost(editor, postByAuthorA)).toBe(true)
      expect(canDeletePost(authorA, postByAuthorA)).toBe(true)

      expect(canDeletePost(authorB, postByAuthorA)).toBe(false)
      expect(canDeletePost(admin, postByAuthorA)).toBe(false)
    })

    it('canPublishPost and canUnpublishPost follow backend rules', () => {
      expect(canPublishPost(editor, postByAuthorA)).toBe(true)
      expect(canPublishPost(authorA, postByAuthorA)).toBe(true)
      expect(canPublishPost(authorB, postByAuthorA)).toBe(false)

      expect(canUnpublishPost(editor, postByAuthorA)).toBe(true)
      expect(canUnpublishPost(authorA, postByAuthorA)).toBe(true)
      expect(canUnpublishPost(authorB, postByAuthorA)).toBe(false)
    })

    it('canManageFeaturedImage allows Editor or Author owner', () => {
      expect(canManageFeaturedImage(editor, postByAuthorA)).toBe(true)
      expect(canManageFeaturedImage(authorA, postByAuthorA)).toBe(true)
      expect(canManageFeaturedImage(authorB, postByAuthorA)).toBe(false)
      expect(canManageFeaturedImage(admin, postByAuthorA)).toBe(false)
    })
  })

  describe('Comment Rules', () => {
    it('canCreateComment allows any authenticated user', () => {
      expect(canCreateComment(authorA)).toBe(true)
      expect(canCreateComment(noRoleUser)).toBe(true)
      expect(canCreateComment(null)).toBe(false)
    })

    it('canEditComment and canDeleteComment require comment ownership', () => {
      expect(canEditComment(authorA, commentByAuthorA)).toBe(true)
      expect(canEditComment(authorB, commentByAuthorA)).toBe(false)
      expect(canEditComment(editor, commentByAuthorA)).toBe(false)

      expect(canDeleteComment(authorA, commentByAuthorA)).toBe(true)
      expect(canDeleteComment(authorB, commentByAuthorA)).toBe(false)
    })

    it('canModerateComment requires Editor role', () => {
      expect(canModerateComment(editor)).toBe(true)
      expect(canModerateComment(multiRole)).toBe(true)
      expect(canModerateComment(authorA)).toBe(false)
      expect(canModerateComment(admin)).toBe(false)
      expect(canModerateComment(null)).toBe(false)
    })
  })

  describe('Taxonomy & Admin Rules', () => {
    it('canManageCategories and canManageTags require Editor role', () => {
      expect(canManageCategories(editor)).toBe(true)
      expect(canManageCategories(authorA)).toBe(false)
      expect(canManageCategories(admin)).toBe(false)

      expect(canManageTags(editor)).toBe(true)
      expect(canManageTags(authorA)).toBe(false)
      expect(canManageTags(admin)).toBe(false)
    })

    it('canViewUserAdministration and canManageUsers require Administrator role', () => {
      expect(canViewUserAdministration(admin)).toBe(true)
      expect(canViewUserAdministration(multiRole)).toBe(true)
      expect(canViewUserAdministration(editor)).toBe(false)
      expect(canViewUserAdministration(authorA)).toBe(false)

      expect(canManageUsers(admin)).toBe(true)
      expect(canManageUsers(editor)).toBe(false)
    })
  })
})
