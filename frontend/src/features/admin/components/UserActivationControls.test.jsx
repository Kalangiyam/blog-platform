import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import UserActivationControls from './UserActivationControls.jsx'

describe('UserActivationControls', () => {
  it('renders Activate button for inactive user', async () => {
    const userObj = { id: 1, username: 'inactive_user', is_active: false }
    const onActivateMock = vi.fn()

    render(
      <UserActivationControls
        onActivate={onActivateMock}
        onDeactivate={vi.fn()}
        user={userObj}
      />,
    )

    const activateBtn = screen.getByRole('button', { name: /Activate Account/i })
    expect(activateBtn).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(activateBtn)
    expect(onActivateMock).toHaveBeenCalled()
  })

  it('renders Deactivate button for active user and triggers modal confirmation', async () => {
    const userObj = { id: 1, username: 'active_user', is_active: true }
    const onDeactivateMock = vi.fn()

    render(
      <UserActivationControls
        onActivate={vi.fn()}
        onDeactivate={onDeactivateMock}
        user={userObj}
      />,
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Deactivate Account/i }))

    // Modal should appear
    expect(screen.getByText('Confirm Account Deactivation')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to deactivate account/i)).toBeInTheDocument()

    // Confirm deactivation
    await user.click(screen.getByRole('button', { name: /Yes, Deactivate User/i }))
    expect(onDeactivateMock).toHaveBeenCalled()
  })
})
