import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const accountSecurityMocks = vi.hoisted(() => ({
  handleRequestPasswordReset: vi.fn(),
  isSubmitting: false,
  error: null,
  successMessage: null,
}))

vi.mock('../hooks/useAccountSecurity.js', () => ({
  useAccountSecurity: () => accountSecurityMocks,
}))

import ForgotPasswordPage from './ForgotPasswordPage.jsx'

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders reset password request form and submits email', () => {
    accountSecurityMocks.handleRequestPasswordReset.mockResolvedValue({})

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument()

    const emailInput = screen.getByLabelText(/email address/i)
    const submitBtn = screen.getByRole('button', { name: /send reset instructions/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.click(submitBtn)

    expect(accountSecurityMocks.handleRequestPasswordReset).toHaveBeenCalledWith({
      email: 'user@example.com',
    })
  })
})
