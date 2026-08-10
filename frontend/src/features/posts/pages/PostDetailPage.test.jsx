import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  getPublishedPost: vi.fn(),
  getPostComments: vi.fn().mockResolvedValue({ count: 0, results: [] }),
}))
vi.mock('../api/postsApi.js', () => ({ getPublishedPost: apiMocks.getPublishedPost }))
vi.mock('../../comments/api/commentsApi.js', () => ({
  getPostComments: apiMocks.getPostComments,
  createPostComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
}))

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import { PostError, POST_ERROR_CODES } from '../utils/postErrors.js'
import PostDetailPage from './PostDetailPage.jsx'

const POST = {
  id: 1,
  title: 'Detailed post',
  slug: 'detailed-post',
  excerpt: 'A detailed summary.',
  content: 'First paragraph.\n\nSecond paragraph.',
  featured_image_url: null,
  author: { id: 2, username: 'ada' },
  published_at: '2026-02-03T12:00:00Z',
  categories: [{ name: 'Architecture', slug: 'architecture' }],
  tags: [{ name: 'React', slug: 'react' }],
}

const defaultAuthContextValue = {
  user: null,
  status: AUTH_STATUS.UNAUTHENTICATED,
  isAuthenticated: false,
  authError: null,
  login: vi.fn(),
  logout: vi.fn(),
  clearAuthError: vi.fn(),
  hasRole: vi.fn(() => false),
  hasAnyRole: vi.fn(() => false),
}

function renderDetail(authContextValue = defaultAuthContextValue) {
  return render(
    <AuthContext.Provider value={authContextValue}>
      <MemoryRouter initialEntries={['/posts/detailed-post']}>
        <Routes>
          <Route path="/posts/:postSlug" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.getPostComments.mockResolvedValue({ count: 0, results: [] })
  })

  it('renders all public detail fields as readable content', async () => {
    apiMocks.getPublishedPost.mockResolvedValue(POST)
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Detailed post' })).toBeInTheDocument()
    expect(screen.getByText('By')).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'ada' })).toHaveAttribute('href', '/users/ada')
    expect(within(screen.getByRole('main')).getByText('February 3, 2026')).toBeInTheDocument()
    expect(screen.getByText('A detailed summary.')).toBeInTheDocument()
    expect(screen.getByText(/First paragraph\./)).toBeInTheDocument()
    expect(screen.getByText(/Second paragraph\./)).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Architecture' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('link', { name: '#React' })).toBeInTheDocument()
  })

  it('renders hostile content as text and never creates executable markup', async () => {
    const maliciousPost = {
      ...POST,
      title: '<script>alert(1)</script>',
      content: '<img src=x onerror=alert(2) />',
    }
    apiMocks.getPublishedPost.mockResolvedValue(maliciousPost)
    renderDetail()

    expect(
      await screen.findByRole('heading', { name: '<script>alert(1)</script>' }),
    ).toBeInTheDocument()
    expect(screen.getByText('<img src=x onerror=alert(2) />')).toBeInTheDocument()
    expect(document.querySelector('script')).toBeNull()
  })

  it('renders a distinct missing-post state with a list link', async () => {
    apiMocks.getPublishedPost.mockRejectedValue(new PostError(POST_ERROR_CODES.NOT_FOUND))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Post not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse posts' })).toHaveAttribute('href', '/posts')
  })

  it('retries transient failures', async () => {
    const user = userEvent.setup()
    apiMocks.getPublishedPost
      .mockRejectedValueOnce(new PostError(POST_ERROR_CODES.SERVER))
      .mockResolvedValueOnce(POST)
    renderDetail()

    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Detailed post' })).toBeInTheDocument()
    expect(apiMocks.getPublishedPost).toHaveBeenCalledTimes(2)
  })

  it('links an authenticated author to the edit workflow where featured images are managed', async () => {
    apiMocks.getPublishedPost.mockResolvedValue(POST)

    const authorAuthContext = {
      ...defaultAuthContextValue,
      user: { id: 2, username: 'ada' },
      status: AUTH_STATUS.AUTHENTICATED,
      isAuthenticated: true,
    }

    render(
      <AuthContext.Provider value={authorAuthContext}>
        <MemoryRouter initialEntries={['/posts/detailed-post']}>
          <Routes>
            <Route path="/posts/:postSlug" element={<PostDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByRole('heading', { name: 'Detailed post' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit Post' })).toHaveAttribute(
      'href',
      '/posts/detailed-post/edit',
    )
  })

  it('does not expose the edit workflow to non-author logged in users', async () => {
    apiMocks.getPublishedPost.mockResolvedValue(POST)

    const otherUserAuthContext = {
      ...defaultAuthContextValue,
      user: { id: 99, username: 'other' },
      status: AUTH_STATUS.AUTHENTICATED,
      isAuthenticated: true,
    }

    render(
      <AuthContext.Provider value={otherUserAuthContext}>
        <MemoryRouter initialEntries={['/posts/detailed-post']}>
          <Routes>
            <Route path="/posts/:postSlug" element={<PostDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByRole('heading', { name: 'Detailed post' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Edit Post' })).not.toBeInTheDocument()
  })

  it('links Editors to the edit workflow even when they are not the author', async () => {
    apiMocks.getPublishedPost.mockResolvedValue(POST)

    const editorAuthContext = {
      ...defaultAuthContextValue,
      user: { id: 99, username: 'editor_user' },
      status: AUTH_STATUS.AUTHENTICATED,
      isAuthenticated: true,
      hasRole: vi.fn((role) => role === 'Editor'),
    }

    render(
      <AuthContext.Provider value={editorAuthContext}>
        <MemoryRouter initialEntries={['/posts/detailed-post']}>
          <Routes>
            <Route path="/posts/:postSlug" element={<PostDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByRole('heading', { name: 'Detailed post' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit Post' })).toHaveAttribute(
      'href',
      '/posts/detailed-post/edit',
    )
  })
})
