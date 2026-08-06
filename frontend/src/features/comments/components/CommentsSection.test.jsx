import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import CommentsSection from './CommentsSection.jsx'

const apiMocks = vi.hoisted(() => ({
  getPostComments: vi.fn(),
  createPostComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
}))

vi.mock('../api/commentsApi.js', () => apiMocks)

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

function renderCommentsSection(
  postSlug = 'test-post',
  initialEntry = '/posts/test-post',
  user = null,
) {
  const router = createMemoryRouter(
    [
      {
        path: '/posts/:postSlug',
        element: <CommentsSection postSlug={postSlug} />,
      },
    ],
    { initialEntries: [initialEntry] },
  )

  render(
    <AuthContext.Provider value={createAuthContextValue(user)}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )

  return router
}

describe('CommentsSection', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders loading state initially and then lists comments on success', async () => {
    apiMocks.getPostComments.mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          content: 'First comment',
          author: { id: 10, username: 'alice' },
          created_at: '2026-08-01T10:00:00Z',
        },
        {
          id: 2,
          content: 'Second comment',
          author: { id: 11, username: 'bob' },
          created_at: '2026-08-01T11:00:00Z',
        },
      ],
    })

    renderCommentsSection()

    expect(screen.getByRole('status')).toHaveTextContent('Loading comments...')

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Comments (2)' }),
      ).toBeInTheDocument()
    })

    expect(screen.getByText('First comment')).toBeInTheDocument()
    expect(screen.getByText('Second comment')).toBeInTheDocument()
  })

  it('renders empty state when comments list is empty', async () => {
    apiMocks.getPostComments.mockResolvedValueOnce({
      count: 0,
      next: null,
      previous: null,
      results: [],
    })

    renderCommentsSection()

    await waitFor(() => {
      expect(
        screen.getByText(
          'No comments yet. Be the first to share your thoughts!',
        ),
      ).toBeInTheDocument()
    })
  })

  it('renders error state and retries fetch when retry is clicked', async () => {
    apiMocks.getPostComments
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({
        count: 1,
        results: [
          {
            id: 1,
            content: 'Recovered comment',
            author: { id: 10, username: 'alice' },
          },
        ],
      })

    renderCommentsSection()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network failure')
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(screen.getByText('Recovered comment')).toBeInTheDocument()
    })
  })

  it('allows authenticated user to post a new comment', async () => {
    apiMocks.getPostComments.mockResolvedValueOnce({
      count: 0,
      results: [],
    })
    const newComment = {
      id: 99,
      content: 'Hello world!',
      author: { id: 5, username: 'me' },
      created_at: '2026-08-02T10:00:00Z',
    }
    apiMocks.createPostComment.mockResolvedValueOnce(newComment)

    const currentUser = { id: 5, username: 'me' }
    renderCommentsSection('test-post', '/posts/test-post', currentUser)

    await waitFor(() => {
      expect(
        screen.getByText(
          'No comments yet. Be the first to share your thoughts!',
        ),
      ).toBeInTheDocument()
    })

    const user = userEvent.setup()
    const textarea = screen.getByLabelText('Leave a comment')
    await user.type(textarea, 'Hello world!')
    await user.click(screen.getByRole('button', { name: 'Post Comment' }))

    await waitFor(() => {
      expect(screen.getByText('Hello world!')).toBeInTheDocument()
    })
  })
})
