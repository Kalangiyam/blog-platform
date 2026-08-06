import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({ getPublishedPosts: vi.fn() }))

vi.mock('../api/postsApi.js', () => ({
  getPublishedPosts: apiMocks.getPublishedPosts,
  POSTS_PAGE_SIZE: 20,
}))

import { PostError, POST_ERROR_CODES } from '../utils/postErrors.js'
import PostListPage from './PostListPage.jsx'

const POST = {
  id: 1,
  title: 'First published post',
  slug: 'first-post',
  excerpt: 'Summary',
  featured_image_url: null,
  author: { id: 2, username: 'author' },
  published_at: '2026-01-02T00:00:00Z',
  categories: [],
  tags: [],
}

function response(results = [POST], overrides = {}) {
  return { count: results.length, next: null, previous: null, results, ...overrides }
}

function renderList(initialEntry = '/posts') {
  const router = createMemoryRouter([
    { path: '/posts', element: <PostListPage /> },
    { path: '/posts/:postSlug', element: <h1>Post destination</h1> },
  ], { initialEntries: [initialEntry] })
  render(<RouterProvider router={router} />)
  return router
}

function deferred() {
  let resolve
  const promise = new Promise((resolver) => { resolve = resolver })
  return { promise, resolve }
}

describe('PostListPage', () => {
  beforeEach(() => apiMocks.getPublishedPosts.mockReset())

  it('renders loading, list content, and URL-backed pagination', async () => {
    const user = userEvent.setup()
    apiMocks.getPublishedPosts
      .mockResolvedValueOnce(response([POST], { count: 41, next: 'next' }))
      .mockResolvedValueOnce(response([{ ...POST, id: 2, title: 'Second page post' }], { count: 41 }))
    const router = renderList()

    expect(screen.getByRole('status')).toHaveTextContent('Loading published posts')
    expect(await screen.findByRole('heading', { name: 'First published post' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Posts pagination' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Next' }))
    expect(router.state.location.search).toBe('?page=2')
    expect(await screen.findByRole('heading', { name: 'Second page post' })).toBeInTheDocument()
    expect(apiMocks.getPublishedPosts).toHaveBeenLastCalledWith(2, expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it('canonicalizes invalid and noisy page queries to page one', async () => {
    apiMocks.getPublishedPosts.mockResolvedValue(response())
    const router = renderList('/posts?page=nope&unsafe=value')

    await screen.findByRole('heading', { name: 'First published post' })
    await waitFor(() => expect(router.state.location.search).toBe(''))
    expect(apiMocks.getPublishedPosts).toHaveBeenCalledWith(1, expect.any(Object))
  })

  it('replaces an out-of-range backend page with canonical page one', async () => {
    apiMocks.getPublishedPosts
      .mockRejectedValueOnce(new PostError(POST_ERROR_CODES.INVALID_PAGE))
      .mockResolvedValueOnce(response())
    const router = renderList('/posts?page=99')

    expect(await screen.findByRole('heading', { name: 'First published post' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('')
  })

  it('renders empty and retryable failure states', async () => {
    const user = userEvent.setup()
    apiMocks.getPublishedPosts
      .mockRejectedValueOnce(new PostError(POST_ERROR_CODES.NETWORK))
      .mockResolvedValueOnce(response([]))
    renderList()

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to reach the server')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'No published posts yet' })).toBeInTheDocument()
  })

  it('prevents an older request from overwriting a newer page', async () => {
    const first = deferred()
    apiMocks.getPublishedPosts
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(response([{ ...POST, id: 2, title: 'Current page post' }], { count: 40 }))
    const router = renderList()

    await act(() => router.navigate('/posts?page=2'))
    expect(await screen.findByRole('heading', { name: 'Current page post' })).toBeInTheDocument()

    await act(async () => first.resolve(response([{ ...POST, title: 'Stale post' }])))
    expect(screen.queryByRole('heading', { name: 'Stale post' })).not.toBeInTheDocument()
  })
})
