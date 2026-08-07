import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  confirmEmailVerification: vi.fn(),
}))

vi.mock('../api/accountSecurityApi.js', () => apiMocks)

import EmailVerifyConfirmPage from './EmailVerifyConfirmPage.jsx'

describe('EmailVerifyConfirmPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifies token on mount and displays success message', async () => {
    apiMocks.confirmEmailVerification.mockResolvedValue({
      detail: 'Email verified successfully.',
    })

    render(
      <MemoryRouter initialEntries={['/verify-email/uid123/tok456']}>
        <Routes>
          <Route element={<EmailVerifyConfirmPage />} path="/verify-email/:uid/:token" />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/verifying your email token/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Email verified successfully.')).toBeInTheDocument()
    })

    expect(apiMocks.confirmEmailVerification).toHaveBeenCalledWith({
      uid: 'uid123',
      token: 'tok456',
    })
    expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument()
  })

  it('displays error message when token verification fails', async () => {
    apiMocks.confirmEmailVerification.mockRejectedValue({
      message: 'Invalid or expired email verification link.',
    })

    render(
      <MemoryRouter initialEntries={['/verify-email/uid123/badtoken']}>
        <Routes>
          <Route element={<EmailVerifyConfirmPage />} path="/verify-email/:uid/:token" />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired email verification link.')).toBeInTheDocument()
    })
  })
})
