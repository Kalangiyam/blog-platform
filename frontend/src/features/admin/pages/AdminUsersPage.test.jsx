import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const hookMocks = vi.hoisted(() => ({
  useAdminUsers: vi.fn(),
}))

vi.mock('../hooks/useAdminUsers.js', () => ({
  useAdminUsers: hookMocks.useAdminUsers,
}))

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import AdminUsersPage from './AdminUsersPage.jsx'

const MOCK_USERS = [
  {
    id: 1,
    username: 'admin_user',
    email: 'admin@example.com',
    is_active: true,
    roles: ['Administrator'],
    date_joined: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'author_user',
    email: 'author@example.com',
    is_active: true,
    roles: ['Author'],
    date_joined: '2026-01-02T00:00:00Z',
  },
]

const defaultAuthContext = {
  user: { id: 1, username: 'admin_user' },
  status: AUTH_STATUS.AUTHENTICATED,
  isAuthenticated: true,
  hasRole: vi.fn((role) => role === 'Administrator'),
}

function renderUsersPage() {
  return render(
    <AuthContext.Provider value={defaultAuthContext}>
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user list on success', () => {
    hookMocks.useAdminUsers.mockReturnValue({
      users: MOCK_USERS,
      count: 2,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderUsersPage()

    expect(screen.getByRole('heading', { name: 'User Administration' })).toBeInTheDocument()
    expect(screen.getAllByText('admin_user')[0]).toBeInTheDocument()
    expect(screen.getAllByText('author_user')[0]).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create New User' })).toHaveAttribute(
      'href',
      '/admin/users/new',
    )
  })

  it('renders loading skeleton while loading', () => {
    hookMocks.useAdminUsers.mockReturnValue({
      users: [],
      count: 0,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    renderUsersPage()

    expect(screen.getByRole('status', { name: 'Loading users' })).toBeInTheDocument()
  })

  it('renders error state when hook returns error', () => {
    hookMocks.useAdminUsers.mockReturnValue({
      users: [],
      count: 0,
      isLoading: false,
      error: { code: 'server_error', message: 'Failed to retrieve platform users.' },
      refetch: vi.fn(),
    })

    renderUsersPage()

    expect(screen.getByText('Failed to retrieve platform users.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
  })
})
