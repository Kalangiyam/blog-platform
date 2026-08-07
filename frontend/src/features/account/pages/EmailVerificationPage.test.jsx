import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  user: { email: 'user@example.com', is_email_verified: false },
}))

const accountSecurityMocks = vi.hoisted(() => ({
  handleResendEmailVerification: vi.fn(),
  isSubmitting: false,
  error: null,
  successMessage: null,
}))

vi.mock('../../auth/hooks/useAuth.js', () => ({
  useAuth: () => authMocks,
}))

vi.mock('../hooks/useAccountSecurity.js', () => ({
  useAccountSecurity: () => accountSecurityMocks,
}))

import EmailVerificationPage from './EmailVerificationPage.jsx'

describe('EmailVerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders unverified status badge and allows resending verification email', () => {
    render(
      <MemoryRouter>
        <EmailVerificationPage />
      </MemoryRouter>
    )

    expect(screen.getByText('user@example.com')).toBeInTheDocument()
    expect(screen.getByText('Unverified')).toBeInTheDocument()

    const resendBtn = screen.getByRole('button', { name: /resend verification email/i })
    fireEvent.click(resendBtn)

    expect(accountSecurityMocks.handleResendEmailVerification).toHaveBeenCalled()
  })

  it('renders verified badge when user is already verified', () => {
    authMocks.user = { email: 'user@example.com', is_email_verified: true }

    render(
      <MemoryRouter>
        <EmailVerificationPage />
      </MemoryRouter>
    )

    expect(screen.getByText('✓ Verified')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /resend verification email/i })).not.toBeInTheDocument()
  })
})
