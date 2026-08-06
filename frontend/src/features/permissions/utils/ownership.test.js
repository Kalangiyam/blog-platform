import { describe, expect, it } from 'vitest'

import {
  isCommentOwner,
  isPostOwner,
  isProfileOwner,
  isResourceOwner,
} from './ownership.js'

describe('ownership utility', () => {
  describe('isResourceOwner', () => {
    it('compares numeric IDs correctly', () => {
      const user = { id: 5, username: 'alice' }
      const resource = { author: { id: 5, username: 'alice' } }
      expect(isResourceOwner(user, resource)).toBe(true)
    })

    it('handles numeric string IDs safely', () => {
      const user = { id: '5', username: 'alice' }
      const resource = { author: { id: 5, username: 'alice' } }
      expect(isResourceOwner(user, resource)).toBe(true)
    })

    it('returns false when IDs do not match', () => {
      const user = { id: 5, username: 'alice' }
      const resource = { author: { id: 9, username: 'bob' } }
      expect(isResourceOwner(user, resource)).toBe(false)
    })

    it('falls back to username matching when ID is missing', () => {
      const user = { username: 'alice' }
      const resource = { author: { username: 'alice' } }
      expect(isResourceOwner(user, resource)).toBe(true)
    })

    it('returns false when resource or user is missing/null', () => {
      expect(isResourceOwner(null, { author: { id: 1 } })).toBe(false)
      expect(isResourceOwner({ id: 1 }, null)).toBe(false)
      expect(isResourceOwner(null, null)).toBe(false)
    })
  })

  describe('isPostOwner', () => {
    it('returns true when user owns post author object', () => {
      const user = { id: 10, username: 'author_a' }
      const post = { id: 101, author: { id: 10, username: 'author_a' } }
      expect(isPostOwner(user, post)).toBe(true)
    })

    it('returns false when user is not the post author', () => {
      const user = { id: 11, username: 'author_b' }
      const post = { id: 101, author: { id: 10, username: 'author_a' } }
      expect(isPostOwner(user, post)).toBe(false)
    })
  })

  describe('isCommentOwner', () => {
    it('returns true when user is comment author', () => {
      const user = { id: 7, username: 'commenter' }
      const comment = { id: 55, author: { id: 7, username: 'commenter' } }
      expect(isCommentOwner(user, comment)).toBe(true)
    })

    it('returns false when user is not comment author', () => {
      const user = { id: 8, username: 'other' }
      const comment = { id: 55, author: { id: 7, username: 'commenter' } }
      expect(isCommentOwner(user, comment)).toBe(false)
    })
  })

  describe('isProfileOwner', () => {
    it('returns true when profile belongs to authenticated user', () => {
      const user = { id: 1, username: 'johndoe' }
      const profile = { user: { id: 1, username: 'johndoe' } }
      expect(isProfileOwner(user, profile)).toBe(true)
    })

    it('returns false when profile belongs to a different user', () => {
      const user = { id: 1, username: 'johndoe' }
      const profile = { user: { id: 2, username: 'janedoe' } }
      expect(isProfileOwner(user, profile)).toBe(false)
    })
  })
})
