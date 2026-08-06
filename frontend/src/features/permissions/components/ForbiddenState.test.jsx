import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import ForbiddenState from './ForbiddenState.jsx'

describe('ForbiddenState component', () => {
  it('renders default forbidden page structure with accessible headings', () => {
    render(
      <MemoryRouter>
        <ForbiddenState />
      </MemoryRouter>,
    )

    expect(screen.getByText('403 Forbidden')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Access Restricted' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'You are signed in, but your account does not have permission to access this area.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Return to Home' }),
    ).toBeInTheDocument()
  })

  it('allows customizing title, message, and back link', () => {
    render(
      <MemoryRouter>
        <ForbiddenState
          backText="Go to Posts"
          backUrl="/posts"
          message="Custom permission error message"
          title="Custom Title"
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Custom Title' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Custom permission error message'),
    ).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Go to Posts' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/posts')
  })
})
