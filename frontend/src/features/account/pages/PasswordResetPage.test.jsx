import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const accountSecurityMocks = vi.hoisted(() => ({
  handleConfirmPasswordReset: vi.fn(),
  isSubmitting: false,
  error: null,
  successMessage: null,
}))

vi.mock('../hooks/useAccountSecurity.js', () => ({
  useAccountSecurity: () => accountSecurityMocks,
}))

import PasswordResetPage from './PasswordResetPage.jsx'

describe('PasswordResetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extracts uid and token from route params and submits new password', () => {
    accountSecurityMocks.handleConfirmPasswordReset.mockResolvedValue({})

    render(
      <MemoryRouter initialEntries={['/reset-password/uid123/tok456']}>
        <Routes>
          <Route element={<PasswordResetPage />} path="/reset-password/:uid/:token" />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /set new password/i })).toBeInTheDocument()

    const newInput = screen.getByLabelText(/^new password/i)
    const confirmInput = screen.getByLabelText(/confirm new password/i)
    const submitBtn = screen.getByRole('button', { name: /reset password/i })

    fireEvent.change(newInput, { target: { value: 'NewPassword123!' } })
    fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } })

    fireEvent.click(submitBtn)

    expect(accountSecurityMocks.handleConfirmPasswordReset).toHaveBeenCalledWith({
      uid: 'uid123',
      token: 'tok456',
      new_password: 'NewPassword123!',
      confirm_password: 'NewPassword123!',
    })
  })
})
