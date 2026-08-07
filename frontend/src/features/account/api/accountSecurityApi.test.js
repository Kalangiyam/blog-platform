import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiClientMocks = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock('../../../lib/apiClient.js', () => ({ apiClient: apiClientMocks }))

import {
  changePassword,
  confirmEmailVerification,
  confirmPasswordReset,
  requestPasswordReset,
  sendEmailVerification,
} from './accountSecurityApi.js'

function axiosError(status, data = {}) {
  return new AxiosError('error', undefined, {}, {}, {
    status,
    data,
    headers: {},
    config: {},
  })
}

describe('accountSecurityApi', () => {
  beforeEach(() => {
    apiClientMocks.post.mockReset()
  })

  it('posts password change payload', async () => {
    apiClientMocks.post.mockResolvedValue({ data: { detail: 'Password updated.' } })

    const payload = { current_password: 'old', new_password: 'new', confirm_password: 'new' }
    const result = await changePassword(payload)

    expect(result).toEqual({ detail: 'Password updated.' })
    expect(apiClientMocks.post).toHaveBeenCalledWith('/auth/password/change/', payload, {
      signal: undefined,
    })
  })

  it('posts password reset request payload', async () => {
    apiClientMocks.post.mockResolvedValue({ data: { detail: 'Reset email sent.' } })

    const result = await requestPasswordReset({ email: 'user@example.com' })

    expect(result).toEqual({ detail: 'Reset email sent.' })
    expect(apiClientMocks.post).toHaveBeenCalledWith('/auth/password/reset/', { email: 'user@example.com' }, {
      signal: undefined,
    })
  })

  it('posts password reset confirmation payload', async () => {
    apiClientMocks.post.mockResolvedValue({ data: { detail: 'Password reset confirmed.' } })

    const payload = { uid: 'uid', token: 'tok', new_password: 'new', confirm_password: 'new' }
    const result = await confirmPasswordReset(payload)

    expect(result).toEqual({ detail: 'Password reset confirmed.' })
  })

  it('posts email verification confirmation payload', async () => {
    apiClientMocks.post.mockResolvedValue({ data: { detail: 'Email verified.' } })

    const result = await confirmEmailVerification({ uid: 'uid', token: 'tok' })
    expect(result).toEqual({ detail: 'Email verified.' })
    expect(apiClientMocks.post).toHaveBeenCalledWith('/auth/email/verify/confirm/', { uid: 'uid', token: 'tok' }, { signal: undefined })
  })

  it('handles 429 rate throttling response safely', async () => {
    apiClientMocks.post.mockRejectedValue(axiosError(429))

    await expect(sendEmailVerification()).rejects.toMatchObject({
      message: expect.stringContaining('Too many requests'),
    })
  })

  it('handles 400 validation error responses cleanly', async () => {
    apiClientMocks.post.mockRejectedValue(
      axiosError(400, { current_password: ['Invalid password.'] })
    )

    await expect(changePassword({})).rejects.toMatchObject({
      fieldErrors: { current_password: 'Invalid password.' },
    })
  })
})
