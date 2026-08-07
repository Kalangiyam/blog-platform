import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const moderationMocks = vi.hoisted(() => ({
  data: {
    count: 2,
    previous: null,
    next: null,
    results: [
      { id: 1, content: 'Active comment', is_deleted: false, author: { username: 'alice' }, post_slug: 'p1', post_title: 'Post 1' },
      { id: 2, content: 'Deleted comment', is_deleted: true, author: { username: 'bob' }, post_slug: 'p1', post_title: 'Post 1' },
    ],
  },
  isLoading: false,
  error: null,
  page: 1,
  isDeletedFilter: false,
  pendingActionId: null,
  setPage: vi.fn(),
  setIsDeletedFilter: vi.fn(),
  handleDelete: vi.fn(),
  handleRestore: vi.fn(),
  retry: vi.fn(),
}))

vi.mock('../hooks/useCommentModeration.js', () => ({
  useCommentModeration: () => moderationMocks,
}))

import CommentModerationPage from './CommentModerationPage.jsx'

describe('CommentModerationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders comments list, status badges, and soft-delete/restore controls', () => {
    render(
      <MemoryRouter>
        <CommentModerationPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /comment moderation/i })).toBeInTheDocument()
    expect(screen.getByText('Active comment')).toBeInTheDocument()
    expect(screen.getByText('Deleted comment')).toBeInTheDocument()

    const deleteBtn = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteBtn)
    expect(moderationMocks.handleDelete).toHaveBeenCalledWith(1)

    const restoreBtn = screen.getByRole('button', { name: /restore/i })
    fireEvent.click(restoreBtn)
    expect(moderationMocks.handleRestore).toHaveBeenCalledWith(2)
  })
})
