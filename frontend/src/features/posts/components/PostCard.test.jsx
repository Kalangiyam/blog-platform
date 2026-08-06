import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import PostCard from './PostCard.jsx'

const POST = {
  id: 1,
  title: 'A safe post',
  slug: 'a-safe-post',
  excerpt: 'A useful summary.',
  featured_image_url: 'https://cdn.example.test/post.webp',
  author: { id: 2, username: 'ada' },
  published_at: '2026-01-02T12:00:00Z',
  categories: [{ name: 'Engineering', slug: 'engineering' }],
  tags: [{ name: 'Django', slug: 'django' }],
}

describe('PostCard', () => {
  it('renders the exact list representation and slug link', () => {
    render(<MemoryRouter><PostCard post={POST} /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'A safe post' })).toHaveAttribute('href', '/posts/a-safe-post')
    expect(screen.getByText('By ada')).toBeInTheDocument()
    expect(screen.getByText('January 2, 2026')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Django')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Featured image for A safe post' })).toHaveAttribute('src', POST.featured_image_url)
  })

  it('uses the controlled image fallback for unsafe URLs', () => {
    render(<MemoryRouter><PostCard post={{ ...POST, featured_image_url: 'javascript:alert(1)' }} /></MemoryRouter>)

    expect(screen.getByRole('img', { name: 'Featured image unavailable' })).toBeInTheDocument()
    expect(document.querySelector('img')).not.toBeInTheDocument()
  })
})
