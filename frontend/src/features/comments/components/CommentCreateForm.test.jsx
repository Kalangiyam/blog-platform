import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import CommentCreateForm from './CommentCreateForm.jsx'

function createAuthContextValue(overrides = {}) {
  const status = overrides.status ?? AUTH_STATUS.AUTHENTICATED
  return {
    user: overrides.user ?? { id: 1, username: 'testuser' },
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

function renderForm({ authOverrides = {}, onSubmit = vi.fn() } = {}) {
  const authValue = createAuthContextValue(authOverrides)
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/posts/my-post']}>
        <CommentCreateForm onSubmitComment={onSubmit} />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
  return { authValue }
}

describe('CommentCreateForm', () => {
  it('renders login prompt for unauthenticated users', () => {
    renderForm({ authOverrides: { status: AUTH_STATUS.UNAUTHENTICATED } })

    expect(screen.getByText('Want to join the discussion?')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Log in to comment' }),
    ).toHaveAttribute('href', '/login')
  })

  it('renders textarea and submit button for authenticated users', () => {
    renderForm()

    expect(screen.getByLabelText('Leave a comment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Post Comment' })).toBeDisabled()
  })

  it('enables submit button when content is entered', async () => {
    const user = userEvent.setup()
    renderForm()

    const textarea = screen.getByLabelText('Leave a comment')
    await user.type(textarea, 'Great post!')

    expect(screen.getByRole('button', { name: 'Post Comment' })).toBeEnabled()
  })

  it('submits trimmed content and clears input on success', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue({})
    renderForm({ onSubmit })

    const textarea = screen.getByLabelText('Leave a comment')
    await user.type(textarea, '   Awesome article!   ')
    await user.click(screen.getByRole('button', { name: 'Post Comment' }))

    expect(onSubmit).toHaveBeenCalledWith({ content: 'Awesome article!' })
    expect(textarea).toHaveValue('')
  })

  it('preserves draft content and shows error message on failure', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockRejectedValue({ message: 'Failed to create comment.' })
    renderForm({ onSubmit })

    const textarea = screen.getByLabelText('Leave a comment')
    await user.type(textarea, 'My draft comment')
    await user.click(screen.getByRole('button', { name: 'Post Comment' }))

    expect(onSubmit).toHaveBeenCalled()
    expect(textarea).toHaveValue('My draft comment')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to create comment.',
    )
  })
})
