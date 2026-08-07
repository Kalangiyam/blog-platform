import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  status: 'authenticated',
  user: { username: 'john_author', roles: ['Author'] },
  isAuthenticated: true,
  hasRole: vi.fn(),
}))

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => authMocks,
}))

import AuthNavigation from './AuthNavigation.jsx'

describe('AuthNavigation role-based link visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Dashboard link for Author role and Security link for all authenticated users', () => {
    authMocks.hasRole.mockImplementation((role) => role === 'Author')

    render(
      <MemoryRouter>
        <AuthNavigation />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /security/i })).toBeInTheDocument()
  })

  it('hides Dashboard link for Administrator-only user without Author/Editor role', () => {
    authMocks.user = { username: 'admin_only', roles: ['Administrator'] }
    authMocks.hasRole.mockImplementation((role) => role === 'Administrator')

    render(
      <MemoryRouter>
        <AuthNavigation />
      </MemoryRouter>
    )

    expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /security/i })).toBeInTheDocument()
  })
})
