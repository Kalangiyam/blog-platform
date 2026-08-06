import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import CommentItem from './CommentItem.jsx'

function createAuthContextValue(user = null) {
  return {
    user,
    status: user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED,
    isAuthenticated: Boolean(user),
    authError: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearAuthError: vi.fn(),
    hasRole: vi.fn(() => false),
    hasAnyRole: vi.fn(() => false),
  }
}

function renderCommentItem(
  comment,
  user = null,
  onUpdate = vi.fn(),
  onDelete = vi.fn(),
) {
  render(
    <AuthContext.Provider value={createAuthContextValue(user)}>
      <CommentItem
        comment={comment}
        onUpdateComment={onUpdate}
        onDeleteComment={onDelete}
      />
    </AuthContext.Provider>,
  )
}

describe('CommentItem', () => {
  const sampleComment = {
    id: 42,
    content: 'This is a sample comment with <script>alert("xss")</script>',
    author: { id: 10, username: 'alice' },
    created_at: '2026-08-01T12:00:00Z',
    updated_at: '2026-08-01T12:00:00Z',
  }

  it('renders author username, timestamp, and XSS-safe plain-text content', () => {
    renderCommentItem(sampleComment)

    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This is a sample comment with <script>alert("xss")</script>',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
  })

  it('renders Edit and Delete controls for comment author', () => {
    renderCommentItem(sampleComment, { id: 10, username: 'alice' })

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('hides Edit and Delete controls for non-author', () => {
    renderCommentItem(sampleComment, { id: 99, username: 'bob' })

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
  })

  it('allows inline editing and calling onUpdateComment', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn().mockResolvedValue({})
    renderCommentItem(sampleComment, { id: 10, username: 'alice' }, onUpdate)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const textarea = screen.getByRole('textbox', { name: 'Edit comment' })
    expect(textarea).toHaveValue(sampleComment.content)

    await user.clear(textarea)
    await user.type(textarea, 'Updated content')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onUpdate).toHaveBeenCalledWith(42, { content: 'Updated content' })
  })

  it('shows inline delete confirmation and calls onDeleteComment on confirm', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue({})
    renderCommentItem(
      sampleComment,
      { id: 10, username: 'alice' },
      vi.fn(),
      onDelete,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(
      screen.getByText('Are you sure you want to delete this comment?'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm Delete' }))
    expect(onDelete).toHaveBeenCalledWith(42)
  })

  it('hides (edited) badge for newly created comments with microsecond diff timestamps', () => {
    const freshComment = {
      ...sampleComment,
      created_at: '2026-08-01T12:00:00.100Z',
      updated_at: '2026-08-01T12:00:00.105Z',
    }
    renderCommentItem(freshComment)

    expect(screen.queryByText('(edited)')).not.toBeInTheDocument()
  })

  it('shows (edited) badge when updated_at is at least 1 second after created_at', () => {
    const editedComment = {
      ...sampleComment,
      created_at: '2026-08-01T12:00:00Z',
      updated_at: '2026-08-01T12:05:00Z',
    }
    renderCommentItem(editedComment)

    expect(screen.getByText('(edited)')).toBeInTheDocument()
  })
})

