import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import UserCreateForm from './UserCreateForm.jsx'

describe('UserCreateForm', () => {
  function renderForm(props = {}) {
    return render(
      <MemoryRouter>
        <UserCreateForm onSubmit={vi.fn()} {...props} />
      </MemoryRouter>,
    )
  }

  it('renders required form controls and role options', () => {
    renderForm()

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password \*$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()
    expect(screen.getByText('Author')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })

  it('performs client-side validation on empty submit', async () => {
    const user = userEvent.setup()
    const onSubmitMock = vi.fn()
    renderForm({ onSubmit: onSubmitMock })

    await user.click(screen.getByRole('button', { name: /Create User Account/i }))

    expect(onSubmitMock).not.toHaveBeenCalled()
    expect(screen.getByText('Username is required.')).toBeInTheDocument()
    expect(screen.getByText('Email address is required.')).toBeInTheDocument()
  })

  it('submits valid data including selected roles', async () => {
    const user = userEvent.setup()
    const onSubmitMock = vi.fn()
    renderForm({ onSubmit: onSubmitMock })

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'writer_user' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'writer@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Password \*$/i), { target: { value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Password123!' } })
    await user.click(screen.getByRole('checkbox', { name: /Author/ }))

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
    renderForm({ isSubmitting: true })
    const button = screen.getByRole('button', { name: /Creating User…/i })
    expect(button).toBeDisabled()
  })
})
