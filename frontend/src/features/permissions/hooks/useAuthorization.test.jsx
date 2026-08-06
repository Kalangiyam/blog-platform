import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import { useAuthorization } from './useAuthorization.js'

function createAuthValue(user = null, status = AUTH_STATUS.UNAUTHENTICATED) {
  return {
    user,
    status,
    isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
    authError: null,
    login: () => {},
    logout: () => {},
    clearAuthError: () => {},
    hasRole: (role) => Array.isArray(user?.roles) && user.roles.includes(role),
    hasAnyRole: (roles) =>
      Array.isArray(user?.roles) && roles.some((r) => user.roles.includes(r)),
  }
}

function wrapper(user, status) {
  const value = createAuthValue(user, status)
  return function ContextWrapper({ children }) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }
}

describe('useAuthorization hook', () => {
  it('returns unauthenticated state safely when user is null', () => {
    const { result } = renderHook(() => useAuthorization(), {
      wrapper: wrapper(null, AUTH_STATUS.UNAUTHENTICATED),
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isAuthor).toBe(false)
    expect(result.current.isEditor).toBe(false)
    expect(result.current.isAdministrator).toBe(false)
    expect(result.current.canCreatePost()).toBe(false)
  })

  it('exposes Author role status and capabilities for Author user', () => {
    const user = { id: 1, username: 'author1', roles: ['Author'] }
    const { result } = renderHook(() => useAuthorization(), {
      wrapper: wrapper(user, AUTH_STATUS.AUTHENTICATED),
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAuthor).toBe(true)
    expect(result.current.isEditor).toBe(false)
    expect(result.current.canCreatePost()).toBe(true)

    const ownPost = { id: 10, author: { id: 1, username: 'author1' } }
    const otherPost = { id: 11, author: { id: 2, username: 'author2' } }

    expect(result.current.canEditPost(ownPost)).toBe(true)
    expect(result.current.canEditPost(otherPost)).toBe(false)
  })

  it('exposes Editor capabilities across any post', () => {
    const user = { id: 3, username: 'editor1', roles: ['Editor'] }
    const { result } = renderHook(() => useAuthorization(), {
      wrapper: wrapper(user, AUTH_STATUS.AUTHENTICATED),
    })

    expect(result.current.isEditor).toBe(true)
    expect(result.current.canCreatePost()).toBe(true)

    const otherPost = { id: 11, author: { id: 2, username: 'author2' } }
    expect(result.current.canEditPost(otherPost)).toBe(true)
    expect(result.current.canDeletePost(otherPost)).toBe(true)
    expect(result.current.canPublishPost(otherPost)).toBe(true)
    expect(result.current.canManageFeaturedImage(otherPost)).toBe(true)
  })

  it('exposes Administrator user-management capabilities', () => {
    const user = { id: 4, username: 'admin1', roles: ['Administrator'] }
    const { result } = renderHook(() => useAuthorization(), {
      wrapper: wrapper(user, AUTH_STATUS.AUTHENTICATED),
    })

    expect(result.current.isAdministrator).toBe(true)
    expect(result.current.canViewUserAdministration()).toBe(true)
    expect(result.current.canManageUsers()).toBe(true)

    // Admin-only user does NOT get post editing automatically
    const post = { id: 10, author: { id: 1, username: 'author1' } }
    expect(result.current.canCreatePost()).toBe(false)
    expect(result.current.canEditPost(post)).toBe(false)
  })

  it('handles checking status without raising errors', () => {
    const { result } = renderHook(() => useAuthorization(), {
      wrapper: wrapper(null, AUTH_STATUS.CHECKING),
    })

    expect(result.current.isChecking).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.canCreatePost()).toBe(false)
  })
})
