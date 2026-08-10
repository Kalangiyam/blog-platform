import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  logout: vi.fn(),
}))

const apiMocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
  sendEmailVerification: vi.fn(),
  confirmEmailVerification: vi.fn(),
}))

vi.mock('../../auth/hooks/useAuth.js', () => ({
  useAuth: () => ({ logout: authMocks.logout }),
}))

vi.mock('../api/accountSecurityApi.js', () => apiMocks)

import { useAccountSecurity } from './useAccountSecurity.js'

describe('useAccountSecurity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls changePassword API and triggers local frontend auth logout', async () => {
    apiMocks.changePassword.mockResolvedValue({ detail: 'Password changed successfully.' })
    authMocks.logout.mockResolvedValue()

    const { result } = renderHook(() => useAccountSecurity())

    await act(async () => {
      await result.current.handleChangePassword({
        current_password: 'old',
        new_password: 'new',
        confirm_password: 'new',
      })
    })

    expect(apiMocks.changePassword).toHaveBeenCalledWith({
      current_password: 'old',
      new_password: 'new',
      confirm_password: 'new',
    })
    expect(authMocks.logout).toHaveBeenCalled()
    expect(result.current.successMessage).toBe('Password changed successfully.')
  })

  it('handles request password reset flow', async () => {
    apiMocks.requestPasswordReset.mockResolvedValue({ detail: 'Instructions sent.' })

    const { result } = renderHook(() => useAccountSecurity())

    await act(async () => {
      await result.current.handleRequestPasswordReset({ email: 'test@example.com' })
    })

    expect(apiMocks.requestPasswordReset).toHaveBeenCalledWith({ email: 'test@example.com' })
    expect(result.current.successMessage).toBe('Instructions sent.')
  })

  it('does not log out when password change fails and rolls back', async () => {
    const error = {
      message: 'An unexpected server error occurred.',
      fieldErrors: {},
    }
    apiMocks.changePassword.mockRejectedValue(error)

    const { result } = renderHook(() => useAccountSecurity())

    await act(async () => {
      await expect(
        result.current.handleChangePassword({
          current_password: 'old',
          new_password: 'new',
          confirm_password: 'new',
        }),
      ).rejects.toBe(error)
    })

    expect(authMocks.logout).not.toHaveBeenCalled()
    expect(result.current.error).toBe(error)
  })
})
