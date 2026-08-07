import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import UserRoleEditor from './UserRoleEditor.jsx'

describe('UserRoleEditor', () => {
  it('displays replacement notice and disables save when unchanged', () => {
    render(<UserRoleEditor currentRoles={['Author']} onSave={vi.fn()} />)

    expect(screen.getByText(/Saving replaces the user’s complete application-role collection/i)).toBeInTheDocument()
    const saveButton = screen.getByRole('button', { name: /Save Role Replacement/i })
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when roles are modified and submits complete replacement set', async () => {
    const user = userEvent.setup()
    const onSaveMock = vi.fn()
    render(<UserRoleEditor currentRoles={['Author']} onSave={onSaveMock} />)

    // Toggle Editor on
    await user.click(screen.getByLabelText('Editor'))

    const saveButton = screen.getByRole('button', { name: /Save Role Replacement/i })
    expect(saveButton).toBeEnabled()

    await user.click(saveButton)
    expect(onSaveMock).toHaveBeenCalledWith(['Author', 'Editor'])
  })

  it('renders field error message for role replacement rejection', () => {
    const error = {
      fieldErrors: {
        roles: ['Cannot remove the Administrator role from the final active Administrator.'],
      },
    }

    render(<UserRoleEditor currentRoles={['Administrator']} error={error} onSave={vi.fn()} />)

    expect(
      screen.getByText('Cannot remove the Administrator role from the final active Administrator.'),
    ).toBeInTheDocument()
  })
})
