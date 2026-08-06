import { describe, expect, it } from 'vitest'

import { APPLICATION_ROLES } from '../permissions.constants.js'
import {
  getValidUserRoles,
  hasAllRoles,
  hasAnyRole,
  hasRole,
  isAdministrator,
  isAuthor,
  isEditor,
  isValidRole,
} from './roles.js'

describe('roles utility', () => {
  describe('isValidRole', () => {
    it('returns true for non-empty strings', () => {
      expect(isValidRole('Author')).toBe(true)
      expect(isValidRole('Editor')).toBe(true)
      expect(isValidRole('Administrator')).toBe(true)
    })

    it('returns false for non-string or whitespace-only inputs', () => {
      expect(isValidRole('')).toBe(false)
      expect(isValidRole('   ')).toBe(false)
      expect(isValidRole(null)).toBe(false)
      expect(isValidRole(123)).toBe(false)
      expect(isValidRole({})).toBe(false)
    })
  })

  describe('getValidUserRoles', () => {
    it('extracts valid role array from user object', () => {
      const user = { roles: ['Author', 'Editor'] }
      expect(getValidUserRoles(user)).toEqual(['Author', 'Editor'])
    })

    it('returns null for missing user, missing roles, or malformed entries', () => {
      expect(getValidUserRoles(null)).toBeNull()
      expect(getValidUserRoles({})).toBeNull()
      expect(getValidUserRoles({ roles: 'Author' })).toBeNull()
      expect(getValidUserRoles({ roles: ['Author', ''] })).toBeNull()
      expect(getValidUserRoles({ roles: [123] })).toBeNull()
    })
  })

  describe('hasRole', () => {
    it('returns true when user has exact role', () => {
      const user = { roles: ['Author'] }
      expect(hasRole(user, 'Author')).toBe(true)
    })

    it('returns false when user lacks role', () => {
      const user = { roles: ['Author'] }
      expect(hasRole(user, 'Editor')).toBe(false)
    })

    it('returns false for missing user or invalid role name', () => {
      expect(hasRole(null, 'Author')).toBe(false)
      expect(hasRole({ roles: ['Author'] }, '')).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('returns true if user has at least one required role', () => {
      const user = { roles: ['Author'] }
      expect(hasAnyRole(user, ['Author', 'Editor'])).toBe(true)
    })

    it('returns false if user has none of the required roles', () => {
      const user = { roles: ['Author'] }
      expect(hasAnyRole(user, ['Editor', 'Administrator'])).toBe(false)
    })

    it('returns false for invalid inputs', () => {
      expect(hasAnyRole(null, ['Author'])).toBe(false)
      expect(hasAnyRole({ roles: ['Author'] }, [])).toBe(false)
      expect(hasAnyRole({ roles: ['Author'] }, null)).toBe(false)
    })
  })

  describe('hasAllRoles', () => {
    it('returns true when user possesses all required roles', () => {
      const user = { roles: ['Author', 'Editor'] }
      expect(hasAllRoles(user, ['Author', 'Editor'])).toBe(true)
    })

    it('returns false when user is missing any required role', () => {
      const user = { roles: ['Author'] }
      expect(hasAllRoles(user, ['Author', 'Editor'])).toBe(false)
    })

    it('returns false for invalid inputs', () => {
      expect(hasAllRoles(null, ['Author'])).toBe(false)
      expect(hasAllRoles({ roles: ['Author'] }, [])).toBe(false)
    })
  })

  describe('semantic role helpers', () => {
    it('evaluates isAuthor, isEditor, and isAdministrator correctly', () => {
      const authorUser = { roles: [APPLICATION_ROLES.AUTHOR] }
      const editorUser = { roles: [APPLICATION_ROLES.EDITOR] }
      const adminUser = { roles: [APPLICATION_ROLES.ADMINISTRATOR] }
      const multiUser = {
        roles: [APPLICATION_ROLES.AUTHOR, APPLICATION_ROLES.EDITOR],
      }

      expect(isAuthor(authorUser)).toBe(true)
      expect(isEditor(authorUser)).toBe(false)
      expect(isAdministrator(authorUser)).toBe(false)

      expect(isAuthor(editorUser)).toBe(false)
      expect(isEditor(editorUser)).toBe(true)
      expect(isAdministrator(editorUser)).toBe(false)

      expect(isAuthor(adminUser)).toBe(false)
      expect(isEditor(adminUser)).toBe(false)
      expect(isAdministrator(adminUser)).toBe(true)

      expect(isAuthor(multiUser)).toBe(true)
      expect(isEditor(multiUser)).toBe(true)
      expect(isAdministrator(multiUser)).toBe(false)
    })

    it('returns false for user without roles or null user', () => {
      expect(isAuthor(null)).toBe(false)
      expect(isEditor(null)).toBe(false)
      expect(isAdministrator(null)).toBe(false)

      expect(isAuthor({ roles: [] })).toBe(false)
      expect(isEditor({ roles: [] })).toBe(false)
      expect(isAdministrator({ roles: [] })).toBe(false)
    })
  })
})
