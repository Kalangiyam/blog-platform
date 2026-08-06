import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import SearchPagination from './SearchPagination.jsx'

function renderWithRouter(ui) {
  const router = createMemoryRouter(
    [{ path: '*', element: ui }],
    { initialEntries: ['/search?q=django'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('SearchPagination', () => {
  it('returns null if total pages is 1 or less', () => {
    const { container } = renderWithRouter(
      <SearchPagination count={5} currentPage={1} pageSize={10} query="django" />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders previous and next links preserving query', () => {
    renderWithRouter(
      <SearchPagination count={30} currentPage={2} pageSize={10} query="django" />,
    )

    const prevLink = screen.getByRole('link', { name: /previous/i })
    expect(prevLink).toHaveAttribute('href', '/search?q=django')

    const nextLink = screen.getByRole('link', { name: /next/i })
    expect(nextLink).toHaveAttribute('href', '/search?q=django&page=3')
  })

  it('omits previous link on page 1', () => {
    renderWithRouter(
      <SearchPagination count={30} currentPage={1} pageSize={10} query="django" />,
    )

    expect(screen.queryByRole('link', { name: /previous/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /next/i })).toBeInTheDocument()
  })

  it('omits next link on final page', () => {
    renderWithRouter(
      <SearchPagination count={30} currentPage={3} pageSize={10} query="django" />,
    )

    expect(screen.getByRole('link', { name: /previous/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /next/i })).not.toBeInTheDocument()
  })
})
