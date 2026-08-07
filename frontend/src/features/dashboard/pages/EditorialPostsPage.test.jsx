import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  isEditor: true,
  canCreatePost: vi.fn().mockReturnValue(true),
}))

const dashboardMocks = vi.hoisted(() => ({
  postsData: {
    count: 2,
    previous: null,
    next: null,
    results: [
      { id: 1, title: 'Draft Post', slug: 'draft-post', status: 'draft', is_deleted: false, author: { username: 'john' }, created_at: '2026-01-01T00:00:00Z' },
      { id: 2, title: 'Published Post', slug: 'pub-post', status: 'published', is_deleted: false, author: { username: 'jane' }, created_at: '2026-01-02T00:00:00Z' },
    ],
  },
  isLoading: false,
  error: null,
  page: 1,
  statusFilter: '',
  isDeletedFilter: false,
  pendingActionSlug: null,
  setPage: vi.fn(),
  setStatusFilter: vi.fn(),
  setIsDeletedFilter: vi.fn(),
  handlePublish: vi.fn(),
  handleUnpublish: vi.fn(),
  handleDelete: vi.fn(),
  handleRestore: vi.fn(),
  retry: vi.fn(),
}))

vi.mock('../../permissions/hooks/useAuthorization.js', () => ({
  useAuthorization: () => authMocks,
}))

vi.mock('../hooks/useEditorialPosts.js', () => ({
  useEditorialPosts: () => dashboardMocks,
}))

import EditorialPostsPage from './EditorialPostsPage.jsx'

describe('EditorialPostsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders post list, status filter, and action buttons', () => {
    render(
      <MemoryRouter>
        <EditorialPostsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Draft Post')).toBeInTheDocument()
    expect(screen.getByText('Published Post')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /\+ create new post/i })).toBeInTheDocument()

    const select = screen.getByLabelText(/filter by status/i)
    fireEvent.change(select, { target: { value: 'draft' } })

    expect(dashboardMocks.setStatusFilter).toHaveBeenCalledWith('draft')
  })
})
