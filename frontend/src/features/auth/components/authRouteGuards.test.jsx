import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'

import { AuthContext, AUTH_STATUS } from '../context/AuthContext.js'
import AnonymousOnlyRoute from './AnonymousOnlyRoute.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleProtectedRoute from './RoleProtectedRoute.jsx'

function createAuthValue(overrides = {}) {
  const status = overrides.status ?? AUTH_STATUS.UNAUTHENTICATED

  return {
    user: null,
    status,
    isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
    authError: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearAuthError: vi.fn(),
    hasRole: vi.fn(() => false),
    hasAnyRole: vi.fn(() => false),
    ...overrides,
  }
}

function renderRoutes(routes, { auth, initialEntry } = {}) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry ?? '/'],
  })

  render(
    <AuthContext.Provider value={createAuthValue(auth)}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )

  return router
}

function protectedRoutes() {
  return [
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: '/protected',
          element: <h1>Protected content</h1>,
        },
      ],
    },
    {
      path: '/login',
      element: <h1>Login destination</h1>,
    },
  ]
}

describe('ProtectedRoute', () => {
  it('shows the session loading state without exposing protected content', () => {
    renderRoutes(protectedRoutes(), {
      auth: { status: AUTH_STATUS.CHECKING },
      initialEntry: '/protected',
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking your session',
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects an anonymous user and preserves the attempted location', async () => {
    const router = renderRoutes(protectedRoutes(), {
      auth: { status: AUTH_STATUS.UNAUTHENTICATED },
      initialEntry: '/protected?draft=1#editor',
    })

    await screen.findByRole('heading', { name: 'Login destination' })

    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.state).toEqual({
      from: {
        pathname: '/protected',
        search: '?draft=1',
        hash: '#editor',
      },
    })
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('renders protected content for an authenticated user', () => {
    renderRoutes(protectedRoutes(), {
      auth: { status: AUTH_STATUS.AUTHENTICATED },
      initialEntry: '/protected',
    })

    expect(
      screen.getByRole('heading', { name: 'Protected content' }),
    ).toBeInTheDocument()
  })
})

function anonymousOnlyRoutes() {
  return [
    {
      element: <AnonymousOnlyRoute />,
      children: [
        {
          path: '/login',
          element: <h1>Login form</h1>,
        },
      ],
    },
    {
      path: '/',
      element: <h1>Public home</h1>,
    },
    {
      path: '/return-target',
      element: <h1>Safe return target</h1>,
    },
  ]
}

describe('AnonymousOnlyRoute', () => {
  it('shows the session loading state instead of the anonymous content', () => {
    renderRoutes(anonymousOnlyRoutes(), {
      auth: { status: AUTH_STATUS.CHECKING },
      initialEntry: '/login',
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking your session',
    )
    expect(screen.queryByText('Login form')).not.toBeInTheDocument()
  })

  it('renders the login route for an unauthenticated user', () => {
    renderRoutes(anonymousOnlyRoutes(), {
      auth: { status: AUTH_STATUS.UNAUTHENTICATED },
      initialEntry: '/login',
    })

    expect(
      screen.getByRole('heading', { name: 'Login form' }),
    ).toBeInTheDocument()
  })

  it('redirects an authenticated user away from login', async () => {
    const router = renderRoutes(anonymousOnlyRoutes(), {
      auth: { status: AUTH_STATUS.AUTHENTICATED },
      initialEntry: '/login',
    })

    await screen.findByRole('heading', { name: 'Public home' })

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('preserves a safe attempted path when authentication completes', async () => {
    const router = renderRoutes(anonymousOnlyRoutes(), {
      auth: { status: AUTH_STATUS.AUTHENTICATED },
      initialEntry: {
        pathname: '/login',
        state: {
          from: {
            pathname: '/return-target',
            search: '?tab=security',
            hash: '#details',
          },
        },
      },
    })

    await screen.findByRole('heading', { name: 'Safe return target' })

    expect(router.state.location.pathname).toBe('/return-target')
    expect(router.state.location.search).toBe('?tab=security')
    expect(router.state.location.hash).toBe('#details')
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('falls back to home for an unsafe authenticated return path', async () => {
    const router = renderRoutes(anonymousOnlyRoutes(), {
      auth: { status: AUTH_STATUS.AUTHENTICATED },
      initialEntry: {
        pathname: '/login',
        state: {
          from: 'https://evil.example/phishing',
        },
      },
    })

    await screen.findByRole('heading', { name: 'Public home' })

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.historyAction).toBe('REPLACE')
  })
})

function roleRoutes(requiredRoles) {
  return [
    {
      path: '/editor',
      element: (
        <RoleProtectedRoute requiredRoles={requiredRoles}>
          <h1>Editorial workspace</h1>
        </RoleProtectedRoute>
      ),
    },
    {
      path: '/login',
      element: <h1>Login destination</h1>,
    },
  ]
}

function roleAuth(roles) {
  return {
    status: AUTH_STATUS.AUTHENTICATED,
    user: { roles },
    hasAnyRole: vi.fn((requiredRoles) =>
      requiredRoles.some((role) => roles.includes(role)),
    ),
  }
}

describe('RoleProtectedRoute', () => {
  it('does not expose role-protected content while checking', () => {
    renderRoutes(roleRoutes(['Editor']), {
      auth: { status: AUTH_STATUS.CHECKING },
      initialEntry: '/editor',
    })

    expect(screen.getByRole('status')).toHaveTextContent(
      'Checking your session',
    )
    expect(
      screen.queryByText('Editorial workspace'),
    ).not.toBeInTheDocument()
  })

  it('redirects an anonymous user through the login flow', async () => {
    const router = renderRoutes(roleRoutes(['Editor']), {
      auth: { status: AUTH_STATUS.UNAUTHENTICATED },
      initialEntry: '/editor?queue=pending#review',
    })

    await screen.findByRole('heading', { name: 'Login destination' })

    expect(router.state.location.state).toEqual({
      from: {
        pathname: '/editor',
        search: '?queue=pending',
        hash: '#review',
      },
    })
  })

  it('uses any-role matching for an authorized user', () => {
    const auth = roleAuth(['Editor'])

    renderRoutes(roleRoutes(['Author', 'Editor']), {
      auth,
      initialEntry: '/editor',
    })

    expect(
      screen.getByRole('heading', { name: 'Editorial workspace' }),
    ).toBeInTheDocument()
    expect(auth.hasAnyRole).toHaveBeenCalledWith(['Author', 'Editor'])
  })

  it('renders the controlled unauthorized page when a role is missing', () => {
    renderRoutes(roleRoutes(['Editor']), {
      auth: roleAuth(['Author']),
      initialEntry: '/editor',
    })

    expect(
      screen.getByRole('heading', {
        name: 'Your account does not have access',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Editorial workspace'),
    ).not.toBeInTheDocument()
  })

  it('does not infer Editor access from Administrator', () => {
    renderRoutes(roleRoutes(['Editor']), {
      auth: roleAuth(['Administrator']),
      initialEntry: '/editor',
    })

    expect(
      screen.getByRole('heading', {
        name: 'Your account does not have access',
      }),
    ).toBeInTheDocument()
  })

  it('fails closed for malformed role configuration', async () => {
    const hasAnyRole = vi.fn(() => true)

    renderRoutes(roleRoutes([]), {
      auth: {
        status: AUTH_STATUS.AUTHENTICATED,
        hasAnyRole,
      },
      initialEntry: '/editor',
    })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Your account does not have access',
        }),
      ).toBeInTheDocument()
    })
    expect(hasAnyRole).not.toHaveBeenCalled()
  })
})
