import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'

import { AuthContext, AUTH_STATUS } from '../context/AuthContext.js'
import {
  AUTH_ERROR_CODES,
  createAuthError,
} from '../utils/authErrors.js'
import LoginPage from './LoginPage.jsx'

const CURRENT_USER = Object.freeze({
  id: 7,
  username: 'reader',
  email: 'reader@example.com',
  first_name: 'Read',
  last_name: 'Er',
  roles: ['Author'],
})

function LoginAuthHarness({
  children,
  clearAuthErrorSpy,
  initialAuthError,
  loginMock,
}) {
  const [authError, setAuthError] = useState(initialAuthError ?? null)

  function clearAuthError() {
    clearAuthErrorSpy()
    setAuthError(null)
  }

  async function login(credentials) {
    setAuthError(null)

    try {
      return await loginMock(credentials)
    } catch (error) {
      setAuthError(error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: null,
        status: AUTH_STATUS.UNAUTHENTICATED,
        isAuthenticated: false,
        authError,
        login,
        logout: vi.fn(),
        clearAuthError,
        hasRole: vi.fn(() => false),
        hasAnyRole: vi.fn(() => false),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function renderLogin({
  initialAuthError = null,
  initialEntry = '/login',
  loginMock = vi.fn().mockResolvedValue(CURRENT_USER),
} = {}) {
  const clearAuthErrorSpy = vi.fn()
  const router = createMemoryRouter(
    [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/',
        element: <h1>Home destination</h1>,
      },
      {
        path: '/dashboard',
        element: <h1>Dashboard destination</h1>,
      },
    ],
    { initialEntries: [initialEntry] },
  )

  render(
    <LoginAuthHarness
      clearAuthErrorSpy={clearAuthErrorSpy}
      initialAuthError={initialAuthError}
      loginMock={loginMock}
    >
      <RouterProvider router={router} />
    </LoginAuthHarness>,
  )

  return { clearAuthErrorSpy, loginMock, router }
}

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, reject, resolve }
}

async function fillValidCredentials(
  user,
  { email = 'reader@example.com', password = 'correct-password' } = {},
) {
  await user.type(screen.getByLabelText('Email address'), email)
  await user.type(screen.getByLabelText('Password'), password)
}

describe('LoginPage validation and accessibility', () => {
  it('renders a semantic password-manager-friendly login form', () => {
    renderLogin()

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('autocomplete', 'email')
    expect(emailInput).toBeRequired()
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute(
      'autocomplete',
      'current-password',
    )
    expect(passwordInput).toBeRequired()
    expect(submitButton.closest('form')).toBeInTheDocument()
  })

  it('reports both required fields and focuses email after an empty submit', async () => {
    const user = userEvent.setup()
    const { loginMock } = renderLogin()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')

    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(emailInput).toHaveFocus()
    expect(emailInput).toHaveAttribute(
      'aria-describedby',
      'login-email-error',
    )
    expect(passwordInput).toHaveAttribute(
      'aria-describedby',
      'login-password-error',
    )
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('does not submit without an email address', async () => {
    const user = userEvent.setup()
    const { loginMock } = renderLogin()

    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.queryByText('Enter your password.')).not.toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('does not submit without a password', async () => {
    const user = userEvent.setup()
    const { loginMock } = renderLogin()

    await user.type(
      screen.getByLabelText('Email address'),
      'reader@example.com',
    )
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(
      screen.queryByText('Enter your email address.'),
    ).not.toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('rejects an invalid email format before calling authentication', async () => {
    const user = userEvent.setup()
    const { loginMock } = renderLogin()

    await fillValidCredentials(user, { email: 'not-an-email' })
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      screen.getByText('Enter a valid email address.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toHaveFocus()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('clears an existing authentication error when the user edits a field', async () => {
    const user = userEvent.setup()
    const { clearAuthErrorSpy } = renderLogin({
      initialAuthError: createAuthError(AUTH_ERROR_CODES.NETWORK),
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to reach the server',
    )

    await user.type(screen.getByLabelText('Email address'), 'r')

    expect(clearAuthErrorSpy).toHaveBeenCalled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('LoginPage submission and redirects', () => {
  it('submits trimmed email and unchanged password, then replaces with the safe return path', async () => {
    const user = userEvent.setup()
    const initialEntry = {
      pathname: '/login',
      state: {
        from: {
          pathname: '/dashboard',
          search: '?tab=mine',
          hash: '#drafts',
        },
      },
    }
    const { loginMock, router } = renderLogin({ initialEntry })

    await fillValidCredentials(user, {
      email: '  reader@example.com  ',
      password: ' password with spaces ',
    })
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await screen.findByRole('heading', { name: 'Dashboard destination' })

    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(loginMock).toHaveBeenCalledWith({
      email: 'reader@example.com',
      password: ' password with spaces ',
    })
    expect(router.state.location).toMatchObject({
      pathname: '/dashboard',
      search: '?tab=mine',
      hash: '#drafts',
    })
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('falls back to home for an unsafe return path', async () => {
    const user = userEvent.setup()
    const { router } = renderLogin({
      initialEntry: {
        pathname: '/login',
        state: {
          from: {
            pathname: '//malicious.example/steal',
            search: '',
            hash: '',
          },
        },
      },
    })

    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await screen.findByRole('heading', { name: 'Home destination' })
    expect(router.state.location.pathname).toBe('/')
  })

  it('prevents duplicate submissions while login is in flight', async () => {
    const user = userEvent.setup()
    const deferred = createDeferred()
    const loginMock = vi.fn(() => deferred.promise)
    const { router } = renderLogin({ loginMock })

    await fillValidCredentials(user)

    const button = screen.getByRole('button', { name: 'Sign in' })
    const form = button.closest('form')

    fireEvent.submit(form)
    fireEvent.submit(form)

    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /Signing in/ })).toBeDisabled()

    await act(async () => {
      deferred.resolve(CURRENT_USER)
      await deferred.promise
    })

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })
  })
})

describe('LoginPage normalized error rendering', () => {
  it('shows generic invalid-credential feedback and clears only the password', async () => {
    const user = userEvent.setup()
    const loginMock = vi
      .fn()
      .mockRejectedValue(createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS))

    renderLogin({ loginMock })
    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password.',
    )
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'reader@example.com',
    )
    expect(screen.getByLabelText('Password')).toHaveValue('')
    expect(screen.getByLabelText('Password')).toHaveFocus()
  })

  it('renders only safe login field mappings for backend validation errors', async () => {
    const user = userEvent.setup()
    const loginMock = vi.fn().mockRejectedValue(
      createAuthError(AUTH_ERROR_CODES.VALIDATION, {
        fieldErrors: {
          email: ['Raw backend email detail'],
          password: ['Raw backend password detail'],
          refresh: ['secret-refresh-token'],
        },
      }),
    )

    renderLogin({ loginMock })
    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Check the highlighted fields and try again.',
    )
    expect(
      screen.getByText('Enter a valid email address.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Check the password and try again.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Raw backend email detail')).not.toBeInTheDocument()
    expect(screen.queryByText('Raw backend password detail')).not.toBeInTheDocument()
    expect(screen.queryByText('secret-refresh-token')).not.toBeInTheDocument()
  })

  it.each([
    [
      AUTH_ERROR_CODES.NETWORK,
      'Unable to reach the server. Check your connection and try again.',
    ],
    [
      AUTH_ERROR_CODES.TIMEOUT,
      'The request took too long. Please try again.',
    ],
    [
      AUTH_ERROR_CODES.SERVER,
      'The authentication service is temporarily unavailable.',
    ],
    [
      AUTH_ERROR_CODES.STORAGE_UNAVAILABLE,
      'Your browser could not store the session securely.',
    ],
    [
      AUTH_ERROR_CODES.UNEXPECTED,
      'Sign in could not be completed. Please try again.',
    ],
  ])('maps %s to safe form feedback', async (code, message) => {
    const user = userEvent.setup()
    const loginMock = vi.fn().mockRejectedValue(createAuthError(code))

    renderLogin({ loginMock })
    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
  })

  it('does not render arbitrary error messages or secrets', async () => {
    const user = userEvent.setup()
    const loginMock = vi.fn().mockRejectedValue({
      code: AUTH_ERROR_CODES.UNEXPECTED,
      message: 'Internal failure containing access-token-secret',
      stack: 'private stack trace',
    })

    renderLogin({ loginMock })
    await fillValidCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sign in could not be completed. Please try again.',
    )
    expect(
      screen.queryByText(/access-token-secret|private stack trace/),
    ).not.toBeInTheDocument()
  })
})
