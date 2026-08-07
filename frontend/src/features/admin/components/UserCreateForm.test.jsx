import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import UserCreateForm from './UserCreateForm.jsx'

describe('UserCreateForm', () => {
  it('renders required form controls and role options', () => {
    render(<UserCreateForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()
    expect(screen.getByText('Author')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })

  it('performs client-side validation on empty submit', async () => {
    const user = userEvent.setup()
    const onSubmitMock = vi.fn()
    render(<UserCreateForm onSubmit={onSubmitMock} />)

    await user.click(screen.getByRole('button', { name: /Create User Account/i }))

    expect(onSubmitMock).not.toHaveBeenCalled()
    expect(screen.getByText('Username is required.')).toBeInTheDocument()
    expect(screen.getByText('Email address is required.')).toBeInTheDocument()
  })

  it('submits valid data including selected roles', async () => {
    const user = userEvent.setup()
    const onSubmitMock = vi.fn()
    render(<UserCreateForm onSubmit={onSubmitMock} />)

    await user.type(screen.getByLabelText(/Username/i), 'writer_user')
    await user.type(screen.getByLabelText(/Email Address/i), 'writer@example.com')
    await user.type(screen.getByLabelText(/^Password/i), 'Password123!')
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123!')
    await user.click(screen.getByLabelText('Author'))

    await user.click(screen.getByRole('button', { name: /Create User Account/i }))

    expect(onSubmitMock).toHaveBeenCalledWith({
      username: 'writer_user',
      email: 'writer@example.com',
      first_name: '',
      last_name: '',
      password: 'Password123!',
      password_confirm: 'Password123!',
      roles: ['Author'],
    })
  })

  it('disables submit button and updates text during submission', () => {
    render(<UserCreateForm isSubmitting={true} onSubmit={vi.fn()} />)
    const button = screen.getByRole('button', { name: /Creating User…/i })
    expect(button).toBeDisabled()
  })
})
