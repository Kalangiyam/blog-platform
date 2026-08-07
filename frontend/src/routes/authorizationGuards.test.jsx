import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  status: 'authenticated',
  user: { username: 'admin_only', roles: ['Administrator'] },
  isAuthenticated: true,
  hasRole: vi.fn(),
  hasAnyRole: vi.fn(),
}))

vi.mock('../features/auth/hooks/useAuth.js', () => ({
  useAuth: () => authMocks,
}))

import RoleProtectedRoute from '../features/auth/components/RoleProtectedRoute.jsx'

describe('Role-based route authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('denies access to Administrator-without-Editor role for Editor-only route', () => {
    authMocks.hasAnyRole.mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={['/dashboard/categories']}>
        <Routes>
          <Route
            element={
              <RoleProtectedRoute requiredRoles={['Editor']}>
                <div>Editor Taxonomy Management</div>
              </RoleProtectedRoute>
            }
            path="/dashboard/categories"
          />
        </Routes>
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: /your account does not have access/i })
    ).toBeInTheDocument()
    expect(screen.queryByText('Editor Taxonomy Management')).not.toBeInTheDocument()
  })

  it('allows access to Editor + Administrator multi-role user', () => {
    authMocks.user = { username: 'multi_role', roles: ['Editor', 'Administrator'] }
    authMocks.hasAnyRole.mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={['/dashboard/categories']}>
        <Routes>
          <Route
            element={
              <RoleProtectedRoute requiredRoles={['Editor']}>
                <div>Editor Taxonomy Management</div>
              </RoleProtectedRoute>
            }
            path="/dashboard/categories"
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Editor Taxonomy Management')).toBeInTheDocument()
  })
})
