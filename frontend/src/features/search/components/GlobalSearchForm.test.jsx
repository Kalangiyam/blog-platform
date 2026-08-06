import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import GlobalSearchForm from './GlobalSearchForm.jsx'

function renderForm(initialUrl = '/') {
  let currentRouter
  const router = createMemoryRouter(
    [
      { path: '*', element: <GlobalSearchForm /> },
      { path: '/search', element: <GlobalSearchForm /> },
    ],
    { initialEntries: [initialUrl] },
  )
  currentRouter = router
  return {
    user: userEvent.setup(),
    router: currentRouter,
    ...render(<RouterProvider router={router} />),
  }
}

describe('GlobalSearchForm', () => {
  it('renders input and submit button with accessible labels', () => {
    renderForm()
    expect(screen.getByRole('search', { name: /global search/i })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: /search blog posts/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit search/i })).toBeInTheDocument()
  })

  it('rejects empty query submission with validation error', async () => {
    const { user } = renderForm()
    const submitButton = screen.getByRole('button', { name: /submit search/i })

    await user.click(submitButton)

    expect(screen.getByText('Please enter a search query.')).toBeInTheDocument()
  })

  it('rejects single character query submission', async () => {
    const { user } = renderForm()
    const input = screen.getByRole('searchbox', { name: /search blog posts/i })
    const submitButton = screen.getByRole('button', { name: /submit search/i })

    await user.type(input, 'a')
    await user.click(submitButton)

    expect(screen.getByText('Search query must be at least 2 characters.')).toBeInTheDocument()
  })

  it('navigates to /search?q=django on valid submission', async () => {
    const { user, router } = renderForm()
    const input = screen.getByRole('searchbox', { name: /search blog posts/i })
    const submitButton = screen.getByRole('button', { name: /submit search/i })

    await user.type(input, '  django  ')
    await user.click(submitButton)

    expect(router.state.location.pathname).toBe('/search')
    expect(router.state.location.search).toBe('?q=django')
  })

  it('submits on Enter key press', async () => {
    const { user, router } = renderForm()
    const input = screen.getByRole('searchbox', { name: /search blog posts/i })

    await user.type(input, 'react{Enter}')

    expect(router.state.location.pathname).toBe('/search')
    expect(router.state.location.search).toBe('?q=react')
  })

  it('populates initial input value from URL query parameter', () => {
    renderForm('/search?q=python')
    const input = screen.getByRole('searchbox', { name: /search blog posts/i })
    expect(input).toHaveValue('python')
  })
})
