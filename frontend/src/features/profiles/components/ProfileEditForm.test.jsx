import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProfileEditForm from './ProfileEditForm.jsx'

describe('ProfileEditForm', () => {
  const initialProfile = {
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'Original Bio',
    website: 'https://original.com',
    location: 'NYC',
    date_of_birth: '1990-01-01',
  }

  it('renders initial form values and read-only identity', () => {
    render(<ProfileEditForm initialProfile={initialProfile} onSubmit={vi.fn()} />)

    expect(screen.getByText('johndoe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText(/biography/i)).toHaveValue('Original Bio')
    expect(screen.getByLabelText(/location/i)).toHaveValue('NYC')
    expect(screen.getByLabelText(/website url/i)).toHaveValue('https://original.com')
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue('1990-01-01')
  })

  it('disables submit button when unchanged', () => {
    render(<ProfileEditForm initialProfile={initialProfile} onSubmit={vi.fn()} />)
    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    expect(saveBtn).toBeDisabled()
  })

  it('enables submit button after field change and submits only changed allowlisted fields', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue({})

    render(<ProfileEditForm initialProfile={initialProfile} onSubmit={handleSubmit} />)

    const bioInput = screen.getByLabelText(/biography/i)
    await user.clear(bioInput)
    await user.type(bioInput, 'Updated Bio Text')

    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    expect(saveBtn).toBeEnabled()

    await user.click(saveBtn)

    expect(handleSubmit).toHaveBeenCalledTimes(1)
    expect(handleSubmit).toHaveBeenCalledWith({
      bio: 'Updated Bio Text',
    })
  })

  it('displays field validation errors mapped from server', () => {
    const serverError = {
      code: 'validation_error',
      message: 'Please fix the highlighted profile errors.',
      fieldErrors: {
        bio: ['Ensure this field has no more than 500 characters.'],
      },
    }

    render(
      <ProfileEditForm
        initialProfile={initialProfile}
        onSubmit={vi.fn()}
        serverError={serverError}
      />
    )

    expect(
      screen.getByText('Ensure this field has no more than 500 characters.')
    ).toBeInTheDocument()
  })
})
