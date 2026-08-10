import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  createAdminUser: vi.fn(),
}))
vi.mock('../api/adminUsersApi.js', () => ({
  createAdminUser: apiMocks.createAdminUser,
}))

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import AdminUserCreatePage from './AdminUserCreatePage.jsx'

const defaultAuthContext = {
  user: { id: 1, username: 'admin_user' },
  status: AUTH_STATUS.AUTHENTICATED,
  isAuthenticated: true,
  hasRole: vi.fn((role) => role === 'Administrator'),
}

function renderCreatePage() {
  return render(
    <AuthContext.Provider value={defaultAuthContext}>
      <MemoryRouter initialEntries={['/admin/users/new']}>
        <Routes>
          <Route path="/admin/users/new" element={<AdminUserCreatePage />} />
          <Route path="/admin/users/:userId" element={<div>User Detail View</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('AdminUserCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders creation header and creates user on valid form submission', async () => {
    const createdUser = { id: 10, username: 'new_writer' }
    apiMocks.createAdminUser.mockResolvedValueOnce(createdUser)

    renderCreatePage()

    expect(screen.getByRole('heading', { name: 'Create User Account' })).toBeInTheDocument()

    const user = userEvent.setup()
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'new_writer' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByLabelText(/^Password \*$/i), { target: { value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Password123!' } })

    await user.click(screen.getByRole('button', { name: /Create User Account/i }))

    expect(apiMocks.createAdminUser).toHaveBeenCalledWith({
      username: 'new_writer',
      email: 'new@example.com',
      first_name: '',
      last_name: '',
      password: 'Password123!',
      password_confirm: 'Password123!',
      roles: [],
    })

    expect(await screen.findByText('User Detail View')).toBeInTheDocument()
  })
})
