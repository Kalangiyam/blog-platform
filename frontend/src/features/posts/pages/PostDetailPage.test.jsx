import { render, screen } from '@testing-library/react'
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
import PostDetailPage, { PostNotFound } from './PostDetailPage.jsx'

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

function renderDetail() {
  render(
    <AuthContext.Provider value={defaultAuthContextValue}>
      <MemoryRouter initialEntries={['/posts/detailed-post']}>
        <Routes>
          <Route path="/posts/:postSlug" element={<PostDetailPage />} />
          <Route path="/posts" element={<h1>Posts destination</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('PostDetailPage', () => {
  beforeEach(() => apiMocks.getPublishedPost.mockReset())

  it('renders all public detail fields as readable content', async () => {
    apiMocks.getPublishedPost.mockResolvedValue(POST)
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Detailed post' })).toBeInTheDocument()
    expect(screen.getByText('A detailed summary.')).toBeInTheDocument()
    expect(screen.getByText(/First paragraph/)).toHaveClass('whitespace-pre-wrap')
    expect(screen.getByText('By ada')).toBeInTheDocument()
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(apiMocks.getPublishedPost).toHaveBeenCalledWith('detailed-post', expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it('renders hostile content as text and never creates executable markup', async () => {
    const hostile = '<img src=x onerror="window.__xss=true"><script>window.__xss=true</script>'
    apiMocks.getPublishedPost.mockResolvedValue({ ...POST, content: hostile })
    renderDetail()

    expect(await screen.findByText(hostile)).toBeInTheDocument()
    expect(document.querySelector('script')).not.toBeInTheDocument()
    expect(document.querySelector('article img')).not.toBeInTheDocument()
    expect(window.__xss).toBeUndefined()
  })

  it('renders a distinct missing-post state with a list link', () => {
    render(<MemoryRouter><PostNotFound /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse posts' })).toHaveAttribute('href', '/posts')
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
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
})
