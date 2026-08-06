import { render, screen, waitFor } from '@testing-library/react'
import AxiosMockAdapter from 'axios-mock-adapter'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { apiClient } from '../../../lib/apiClient.js'
import SearchResultsPage from './SearchResultsPage.jsx'

function renderSearchPage(initialEntries = ['/search']) {
  const router = createMemoryRouter(
    [
      { path: '/search', element: <SearchResultsPage /> },
      { path: '/posts/:postSlug', element: <div>Post Detail Page</div> },
    ],
    { initialEntries },
  )
  return {
    router,
    ...render(<RouterProvider router={router} />),
  }
}

describe('SearchResultsPage', () => {
  let mock

  beforeEach(() => {
    mock = new AxiosMockAdapter(apiClient)
  })

  afterEach(() => {
    mock.restore()
  })

  it('renders initial empty state on /search without calling API', () => {
    renderSearchPage(['/search'])

    expect(screen.getByRole('heading', { name: /search published posts/i })).toBeInTheDocument()
    expect(mock.history.get.length).toBe(0)
  })

  it('fetches and renders matching post search results', async () => {
    mock.onGet('/posts/search/').reply(200, {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 101,
          title: 'Understanding React 19',
          slug: 'understanding-react-19',
          excerpt: 'React 19 brings new features.',
          featured_image_url: null,
          author: { username: 'johndoe' },
          published_at: '2026-08-01T10:00:00Z',
          categories: [{ id: 1, name: 'Tech', slug: 'tech' }],
          tags: [{ id: 1, name: 'React', slug: 'react' }],
        },
      ],
    })

    renderSearchPage(['/search?q=react'])

    expect(screen.getByText(/loading search results/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Understanding React 19')).toBeInTheDocument()
    })

    expect(screen.getByText('React 19 brings new features.')).toBeInTheDocument()
  })

  it('renders no results state when search yields zero matches', async () => {
    mock.onGet('/posts/search/').reply(200, {
      count: 0,
      next: null,
      previous: null,
      results: [],
    })

    renderSearchPage(['/search?q=nonexistent'])

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /no results found/i })).toBeInTheDocument()
    })

    expect(screen.getAllByText(/nonexistent/i).length).toBeGreaterThan(0)
  })

  it('renders error state on network failure and allows retry', async () => {
    mock.onGet('/posts/search/').networkErrorOnce()

    renderSearchPage(['/search?q=django'])

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /network error/i })).toBeInTheDocument()
    })

    const retryButton = screen.getByRole('button', { name: /try again/i })

    mock.onGet('/posts/search/').reply(200, {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 202,
          title: 'Django Mastery',
          slug: 'django-mastery',
          excerpt: 'Mastering Django REST framework.',
          author: { username: 'pydev' },
        },
      ],
    })

    retryButton.click()

    await waitFor(() => {
      expect(screen.getByText('Django Mastery')).toBeInTheDocument()
    })
  })

  it('recovers to page 1 on 404 invalid page error', async () => {
    mock.onGet('/posts/search/').reply(404, { detail: 'Invalid page.' })

    const { router } = renderSearchPage(['/search?q=django&page=99'])

    await waitFor(() => {
      expect(router.state.location.search).toBe('?q=django')
    })
  })

  it('canonicalizes page=1 to URL without page param', async () => {
    mock.onGet('/posts/search/').reply(200, {
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, title: 'Canonical Test', slug: 'canonical-test' }],
    })

    const { router } = renderSearchPage(['/search?q=django&page=1'])

    await waitFor(() => {
      expect(router.state.location.search).toBe('?q=django')
    })
  })
})
