import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  getAdminUserDetail: vi.fn(),
  activateAdminUser: vi.fn(),
  deactivateAdminUser: vi.fn(),
  updateAdminUserRoles: vi.fn(),
}))
vi.mock('../api/adminUsersApi.js', () => ({
  getAdminUserDetail: apiMocks.getAdminUserDetail,
  activateAdminUser: apiMocks.activateAdminUser,
  deactivateAdminUser: apiMocks.deactivateAdminUser,
  updateAdminUserRoles: apiMocks.updateAdminUserRoles,
}))

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import AdminUserDetailPage from './AdminUserDetailPage.jsx'

const MOCK_USER_DETAIL = {
  id: 5,
  username: 'target_user',
  email: 'target@example.com',
  first_name: 'Target',
  last_name: 'User',
  is_active: true,
  roles: ['Author'],
  date_joined: '2026-02-01T12:00:00Z',
  last_login: null,
}

const defaultAuthContext = {
  user: { id: 1, username: 'admin_user' },
  status: AUTH_STATUS.AUTHENTICATED,
  isAuthenticated: true,
  hasRole: vi.fn((role) => role === 'Administrator'),
}

function renderDetailPage() {
  return render(
    <AuthContext.Provider value={defaultAuthContext}>
      <MemoryRouter initialEntries={['/admin/users/5']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('AdminUserDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders summary, status controls, and role replacement editor on success', async () => {
    apiMocks.getAdminUserDetail.mockResolvedValueOnce(MOCK_USER_DETAIL)
    renderDetailPage()

    expect(await screen.findByRole('heading', { name: 'target_user' })).toBeInTheDocument()
    expect(screen.getByText('target@example.com')).toBeInTheDocument()
    expect(screen.getByText('Deactivate Account')).toBeInTheDocument()
    expect(screen.getByText('Application Role Replacement')).toBeInTheDocument()
  })

  it('handles user not found (404) gracefully', async () => {
    apiMocks.getAdminUserDetail.mockRejectedValueOnce({
      code: 'not_found',
      message: 'The requested user was not found.',
    })
    renderDetailPage()

    expect(await screen.findByText('User Not Found')).toBeInTheDocument()
    expect(screen.getByText('The requested user was not found.')).toBeInTheDocument()
  })

  it('allows replacing application roles with complete payload', async () => {
    apiMocks.getAdminUserDetail.mockResolvedValueOnce(MOCK_USER_DETAIL)
    apiMocks.updateAdminUserRoles.mockResolvedValueOnce({
      ...MOCK_USER_DETAIL,
      roles: ['Author', 'Editor'],
    })

    renderDetailPage()
    expect(await screen.findByRole('heading', { name: 'target_user' })).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Editor'))
    await user.click(screen.getByRole('button', { name: /Save Role Replacement/i }))

    expect(apiMocks.updateAdminUserRoles).toHaveBeenCalledWith('5', ['Author', 'Editor'])
    expect(await screen.findByText('Application roles replaced successfully.')).toBeInTheDocument()
  })
})
