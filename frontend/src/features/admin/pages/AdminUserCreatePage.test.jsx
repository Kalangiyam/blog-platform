import { render, screen } from '@testing-library/react'
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
    await user.type(screen.getByLabelText(/Username/i), 'new_writer')
    await user.type(screen.getByLabelText(/Email Address/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^Password/i), 'Password123!')
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123!')

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
