import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearAccessToken,
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from './tokenStorage.js'

const REFRESH_TOKEN_STORAGE_KEY = 'blog-platform.auth.refresh-token'

describe('tokenStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    clearAccessToken()
  })

  it('keeps access in memory and persists only the namespaced refresh token', () => {
    expect(
      setAuthTokens({ access: 'access-secret', refresh: 'refresh-secret' }),
    ).toBe(true)

    expect(getAccessToken()).toBe('access-secret')
    expect(getRefreshToken()).toBe('refresh-secret')
    expect(window.localStorage.length).toBe(1)
    expect(window.localStorage.key(0)).toBe(REFRESH_TOKEN_STORAGE_KEY)
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe(
      'refresh-secret',
    )
    expect(JSON.stringify(window.localStorage)).not.toContain('access-secret')
    expect(window.sessionStorage.length).toBe(0)
  })

  it('clears access independently without removing the persisted refresh token', () => {
    setAuthTokens({ access: 'access-token', refresh: 'refresh-token' })

    clearAccessToken()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBe('refresh-token')
  })

  it('clears both token locations explicitly', () => {
    setAuthTokens({ access: 'access-token', refresh: 'refresh-token' })

    expect(clearAuthTokens()).toBe(true)

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(window.localStorage.length).toBe(0)
  })

  it('handles missing and invalid token pairs without retaining stale credentials', () => {
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()

    setAuthTokens({ access: 'old-access', refresh: 'old-refresh' })

    expect(setAuthTokens({ access: 'new-access' })).toBe(false)
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('fails closed when a refresh-token write is restricted', () => {
    setAuthTokens({ access: 'old-access', refresh: 'old-refresh' })
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Storage denied', 'SecurityError')
      })

    try {
      expect(
        setAuthTokens({ access: 'new-access', refresh: 'new-refresh' }),
      ).toBe(false)
      expect(getAccessToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
    } finally {
      setItemSpy.mockRestore()
    }
  })

  it('returns no refresh token when storage reads are restricted', () => {
    setAuthTokens({ access: 'access-token', refresh: 'refresh-token' })
    const getItemSpy = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new DOMException('Storage denied', 'SecurityError')
      })

    try {
      expect(getRefreshToken()).toBeNull()
      expect(getAccessToken()).toBe('access-token')
    } finally {
      getItemSpy.mockRestore()
    }
  })

  it('clears memory and reports failure when persistent cleanup is restricted', () => {
    setAuthTokens({ access: 'access-token', refresh: 'refresh-token' })
    const removeItemSpy = vi
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new DOMException('Storage denied', 'SecurityError')
      })

    try {
      expect(clearAuthTokens()).toBe(false)
      expect(getAccessToken()).toBeNull()
      expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe(
        'refresh-token',
      )
    } finally {
      removeItemSpy.mockRestore()
    }
  })

  it('does not log token values during storage operations', () => {
    const consoleSpies = [
      vi.spyOn(console, 'log').mockImplementation(() => {}),
      vi.spyOn(console, 'warn').mockImplementation(() => {}),
      vi.spyOn(console, 'error').mockImplementation(() => {}),
    ]

    try {
      setAuthTokens({
        access: 'never-log-access',
        refresh: 'never-log-refresh',
      })
      getAccessToken()
      getRefreshToken()
      clearAuthTokens()

      for (const consoleSpy of consoleSpies) {
        expect(consoleSpy).not.toHaveBeenCalled()
      }
    } finally {
      for (const consoleSpy of consoleSpies) {
        consoleSpy.mockRestore()
      }
    }
  })
})
