import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const accountSecurityMocks = vi.hoisted(() => ({
  handleChangePassword: vi.fn(),
  isSubmitting: false,
  error: null,
  successMessage: null,
}))

vi.mock('../hooks/useAccountSecurity.js', () => ({
  useAccountSecurity: () => accountSecurityMocks,
}))

import PasswordChangePage from './PasswordChangePage.jsx'

describe('PasswordChangePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders password change form and submits valid inputs', async () => {
    accountSecurityMocks.handleChangePassword.mockResolvedValue({})

    render(
      <MemoryRouter>
        <PasswordChangePage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument()

    const currentInput = screen.getByLabelText(/current password/i)
    const newInput = screen.getByLabelText(/^new password/i)
    const confirmInput = screen.getByLabelText(/confirm new password/i)
    const submitBtn = screen.getByRole('button', { name: /update password/i })

    fireEvent.change(currentInput, { target: { value: 'OldPassword123!' } })
    fireEvent.change(newInput, { target: { value: 'NewPassword123!' } })
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })

    fireEvent.click(submitBtn)

    expect(accountSecurityMocks.handleChangePassword).toHaveBeenCalledWith({
      current_password: 'OldPassword123!',
      new_password: 'NewPassword123!',
      confirm_password: 'NewPassword123!',
    })
  })
})
