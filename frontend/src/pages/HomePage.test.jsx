import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomePage from './HomePage.jsx'

const mockAuth = vi.hoisted(() => ({
  status: 'unauthenticated',
  user: null,
}))

vi.mock('../features/auth/hooks/useAuth.js', () => ({
  useAuth: () => mockAuth,
}))

const mockPostsApi = vi.hoisted(() => ({
  getPublishedPosts: vi.fn(),
  getCategories: vi.fn(),
  getTags: vi.fn(),
}))

vi.mock('../features/posts/api/postsApi.js', () => ({
  POSTS_PAGE_SIZE: 20,
  getPublishedPosts: (...args) => mockPostsApi.getPublishedPosts(...args),
  getCategories: (...args) => mockPostsApi.getCategories(...args),
  getTags: (...args) => mockPostsApi.getTags(...args),
}))

describe('HomePage Component', () => {
  const samplePosts = {
    count: 2,
    next: null,
    previous: null,
    results: [
      {
        id: 101,
        title: 'Building Modern React Apps',
        slug: 'building-modern-react-apps',
        excerpt: 'An in-depth guide on React architectural patterns.',
        published_at: '2026-08-01T12:00:00Z',
        author: { id: 1, username: 'devlead', first_name: 'John', last_name: 'Doe' },
        categories: [{ id: 1, name: 'Frontend', slug: 'frontend' }],
        tags: [{ id: 1, name: 'React', slug: 'react' }],
      },
      {
        id: 102,
        title: 'Django REST Framework Guide',
        slug: 'django-rest-framework-guide',
        excerpt: 'Mastering API permissions and serializers in Django.',
        published_at: '2026-08-02T15:30:00Z',
        author: { id: 2, username: 'pythondjango', first_name: 'Jane', last_name: 'Smith' },
        categories: [{ id: 2, name: 'Backend', slug: 'backend' }],
        tags: [{ id: 2, name: 'Django', slug: 'django' }],
      },
    ],
  }

  const sampleCategories = {
    count: 2,
    results: [
      { id: 1, name: 'Frontend', slug: 'frontend' },
      { id: 2, name: 'Backend', slug: 'backend' },
    ],
  }

  const sampleTags = {
    count: 2,
    results: [
      { id: 1, name: 'React', slug: 'react' },
      { id: 2, name: 'Django', slug: 'django' },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.status = 'unauthenticated'
    mockAuth.user = null

    mockPostsApi.getPublishedPosts.mockResolvedValue(samplePosts)
    mockPostsApi.getCategories.mockResolvedValue(sampleCategories)
    mockPostsApi.getTags.mockResolvedValue(sampleTags)
  })

  it('renders "Latest Articles" heading and public post discovery for anonymous users', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /latest articles/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Building Modern React Apps')).toBeInTheDocument()
      expect(screen.getByText('Django REST Framework Guide')).toBeInTheDocument()
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getAllByText('Frontend').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Backend').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: '#React' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: '#Django' }).length).toBeGreaterThan(0)

    // No workspace actions rendered for anonymous
    expect(screen.queryByText('Workspace Actions')).not.toBeInTheDocument()
  })

  it('handles empty posts state cleanly without showing demo data', async () => {
    mockPostsApi.getPublishedPosts.mockResolvedValue({ count: 0, results: [] })

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'No published articles found' })).toBeInTheDocument()
    })

    // Confirm no fake demo posts exist
    expect(screen.queryByText('Clean Code Principles')).not.toBeInTheDocument()
  })

  it('handles post list error gracefully and allows retry', async () => {
    mockPostsApi.getPublishedPosts.mockRejectedValueOnce(new Error('Network error'))

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Unable to load published articles')).toBeInTheDocument()
    })

    mockPostsApi.getPublishedPosts.mockResolvedValueOnce(samplePosts)
    const retryButton = screen.getByRole('button', { name: /retry request/i })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Building Modern React Apps')).toBeInTheDocument()
    })
  })

  it('renders Author capability workspace actions for Author users', async () => {
    mockAuth.status = 'authenticated'
    mockAuth.user = {
      id: 1,
      username: 'authoruser',
      roles: ['Author'],
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Workspace Actions')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /create post/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /editorial dashboard/i })).toBeInTheDocument()

    // Author should NOT see Editor or Admin controls
    expect(screen.queryByRole('link', { name: /manage categories/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /user management/i })).not.toBeInTheDocument()
  })

  it('renders Editor capability workspace actions for Editor users', async () => {
    mockAuth.status = 'authenticated'
    mockAuth.user = {
      id: 2,
      username: 'editoruser',
      roles: ['Editor'],
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Workspace Actions')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /create post/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /editorial dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /manage categories/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /manage tags/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /moderate comments/i })).toBeInTheDocument()

    // Editor should NOT see Admin user management controls
    expect(screen.queryByRole('link', { name: /user management/i })).not.toBeInTheDocument()
  })

  it('renders ONLY Administrator user management actions for Administrator-only users', async () => {
    mockAuth.status = 'authenticated'
    mockAuth.user = {
      id: 3,
      username: 'adminuser',
      roles: ['Administrator'],
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Workspace Actions')).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /user management/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add user/i })).toBeInTheDocument()

    // Admin-only user must NOT see content authoring/taxonomy controls
    expect(screen.queryByRole('link', { name: /create post/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /editorial dashboard/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /manage categories/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /moderate comments/i })).not.toBeInTheDocument()
  })

  it('combines all capabilities for Multi-role users (Editor + Administrator)', async () => {
    mockAuth.status = 'authenticated'
    mockAuth.user = {
      id: 4,
      username: 'superadmin',
      roles: ['Editor', 'Administrator'],
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Workspace Actions')).toBeInTheDocument()
    })

    // Multi-role user receives both Editorial AND Administrative controls
    expect(screen.getByRole('link', { name: /create post/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /editorial dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /manage categories/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /manage tags/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /moderate comments/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /user management/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add user/i })).toBeInTheDocument()
  })
})
