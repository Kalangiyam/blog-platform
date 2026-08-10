import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'

import { AuthContext, AUTH_STATUS } from '../features/auth/context/AuthContext.js'
import {
  AUTH_ERROR_CODES,
  createAuthError,
} from '../features/auth/utils/authErrors.js'
import RootLayout from './RootLayout.jsx'

const AUTHENTICATED_USER = Object.freeze({
  id: 12,
  username: 'ada-editor',
  email: 'private-email@example.com',
  first_name: 'Ada',
  last_name: 'Editor',
  roles: ['Author', 'Editor'],
  access: 'access-token-must-not-render',
  refresh: 'refresh-token-must-not-render',
})

function createAuthValue(overrides = {}) {
  const status = overrides.status ?? AUTH_STATUS.UNAUTHENTICATED

  return {
    user: null,
    status,
    isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
    authError: null,
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    clearAuthError: vi.fn(),
    hasRole: vi.fn(() => false),
    hasAnyRole: vi.fn(() => false),
    ...overrides,
  }
}

function layoutRoutes() {
  return [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <h1>Public home content</h1>,
        },
        {
          path: 'private',
          element: <h1>Private route content</h1>,
        },
        {
          path: 'login',
          element: <h1>Login route content</h1>,
        },
      ],
    },
  ]
}

function renderLayout({ auth, initialEntry = '/' } = {}) {
  const router = createMemoryRouter(layoutRoutes(), {
    initialEntries: [initialEntry],
  })

  render(
    <AuthContext.Provider value={createAuthValue(auth)}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )

  return router
}

function authForUser(user, overrides = {}) {
  return {
    status: AUTH_STATUS.AUTHENTICATED,
    user,
    hasRole: vi.fn((role) => user.roles.includes(role)),
    ...overrides,
  }
}

function StatefulLogoutAuth({ children, logoutMock, user }) {
  const [state, setState] = useState({
    status: AUTH_STATUS.AUTHENTICATED,
    user,
    authError: null,
  })

  async function logout() {
    setState({
      status: AUTH_STATUS.UNAUTHENTICATED,
      user: null,
      authError: null,
    })

    try {
      return await logoutMock()
    } catch (error) {
      setState({
        status: AUTH_STATUS.UNAUTHENTICATED,
        user: null,
        authError: error,
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        status: state.status,
        isAuthenticated: state.status === AUTH_STATUS.AUTHENTICATED,
        authError: state.authError,
        login: vi.fn(),
        logout,
        clearAuthError: vi.fn(),
        hasRole: vi.fn((role) => state.user?.roles?.includes(role) ?? false),
        hasAnyRole: vi.fn(() => false),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function renderStatefulLogout({ logoutMock, initialEntry = '/private' }) {
  const router = createMemoryRouter(layoutRoutes(), {
    initialEntries: [initialEntry],
  })

  render(
    <StatefulLogoutAuth
      logoutMock={logoutMock}
      user={AUTHENTICATED_USER}
    >
      <RouterProvider router={router} />
    </StatefulLogoutAuth>,
  )

  return router
}

function createDeferred() {
  let resolve
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

describe('RootLayout authentication navigation', () => {
  it('shows a stable checking placeholder without stale account controls', () => {
    renderLayout({
      auth: {
        status: AUTH_STATUS.CHECKING,
        user: AUTHENTICATED_USER,
        hasRole: vi.fn(() => true),
      },
    })

    expect(
      screen.getByRole('status', {
        name: 'Account navigation is loading',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument()
    expect(screen.queryByText('Ada')).not.toBeInTheDocument()
  })

  it('shows only anonymous account navigation when signed out', async () => {
    const user = userEvent.setup()
    const router = renderLayout({
      auth: { status: AUTH_STATUS.UNAUTHENTICATED },
    })
    const accountNavigation = screen.getByRole('navigation', {
      name: 'Account navigation',
    })

    expect(
      within(accountNavigation).getByRole('link', { name: 'Login' }),
    ).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument()

    await user.click(within(accountNavigation).getByRole('link', { name: 'Login' }))

    expect(router.state.location.pathname).toBe('/login')
  })

  it('shows safe current-user data and every independently assigned role', async () => {
    const user = userEvent.setup()
    renderLayout({ auth: authForUser(AUTHENTICATED_USER) })

    const accountNavigation = screen.getByRole('navigation', {
      name: 'Account navigation',
    })

    expect(within(accountNavigation).getByText('Ada')).toBeInTheDocument()
    expect(within(accountNavigation).getByText('Author')).toBeInTheDocument()
    await user.click(within(accountNavigation).getByRole('button', { name: 'User account menu' }))
    const accountMenu = within(accountNavigation).getByRole('menu', { name: 'User account dropdown' })
    expect(within(accountMenu).getByText('Author')).toBeInTheDocument()
    expect(within(accountMenu).getByText('Editor')).toBeInTheDocument()
    expect(
      within(accountMenu).queryByText('Administrator'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('private-email@example.com'),
    ).not.toBeInTheDocument()
    expect(document.body).not.toHaveTextContent('access-token-must-not-render')
    expect(document.body).not.toHaveTextContent('refresh-token-must-not-render')
  })

  it('does not infer role inheritance from Administrator', () => {
    const administrator = {
      ...AUTHENTICATED_USER,
      first_name: '',
      username: 'site-admin',
      roles: ['Administrator'],
    }

    renderLayout({ auth: authForUser(administrator) })

    const accountNavigation = screen.getByRole('navigation', {
      name: 'Account navigation',
    })

    expect(within(accountNavigation).getByText('site-admin')).toBeInTheDocument()
    expect(
      within(accountNavigation).getByText('Administrator'),
    ).toBeInTheDocument()
    expect(within(accountNavigation).queryByText('Editor')).not.toBeInTheDocument()
    expect(within(accountNavigation).queryByText('Author')).not.toBeInTheDocument()
  })
})

describe('RootLayout logout behavior', () => {
  it('navigates home, disables duplicate logout, and sends one request', async () => {
    const user = userEvent.setup()
    const deferred = createDeferred()
    const logoutMock = vi.fn(() => deferred.promise)
    const router = renderLayout({
      auth: authForUser(AUTHENTICATED_USER, { logout: logoutMock }),
      initialEntry: '/private',
    })

    await user.click(screen.getByRole('button', { name: 'User account menu' }))
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    await user.click(screen.getByRole('button', { name: 'User account menu' }))
    const pendingButton = screen.getByRole('button', { name: /Signing out/ })
    expect(pendingButton).toBeDisabled()
    expect(router.state.location.pathname).toBe('/')

    fireEvent.click(pendingButton)
    expect(logoutMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      deferred.resolve()
      await deferred.promise
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Logout' })).toBeEnabled()
    })
  })

  it('always clears visible local identity after successful logout', async () => {
    const user = userEvent.setup()
    const logoutMock = vi.fn().mockResolvedValue(undefined)
    const router = renderStatefulLogout({ logoutMock })

    await user.click(screen.getByRole('button', { name: 'User account menu' }))
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    await screen.findByRole('link', { name: 'Login' })
    expect(router.state.location.pathname).toBe('/')
    expect(screen.queryByText('Ada')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument()
    expect(screen.queryByText(/signed out locally/i)).not.toBeInTheDocument()
    expect(logoutMock).toHaveBeenCalledTimes(1)
  })

  it('clears local identity and shows safe revocation feedback on backend failure', async () => {
    const user = userEvent.setup()
    const logoutMock = vi.fn().mockRejectedValue(
      Object.assign(createAuthError(AUTH_ERROR_CODES.NETWORK), {
        privateDetail: 'refresh-token-secret',
      }),
    )
    const router = renderStatefulLogout({ logoutMock })

    await user.click(screen.getByRole('button', { name: 'User account menu' }))
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    expect(
      await screen.findByText(
        'Signed out locally; server could not confirm session revocation.',
      ),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(screen.queryByText('Ada')).not.toBeInTheDocument()
    expect(screen.queryByText('refresh-token-secret')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument()
    expect(logoutMock).toHaveBeenCalledTimes(1)
  })

  it('uses distinct safe feedback when stored-session removal is uncertain', async () => {
    const user = userEvent.setup()
    const logoutMock = vi
      .fn()
      .mockRejectedValue(
        createAuthError(AUTH_ERROR_CODES.STORAGE_UNAVAILABLE),
      )

    renderStatefulLogout({ logoutMock })
    await user.click(screen.getByRole('button', { name: 'User account menu' }))
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    expect(
      await screen.findByText(
        'You are signed out in this tab, but session removal could not be confirmed.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })
})
