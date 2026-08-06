import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProfileAvatarPlaceholder from './ProfileAvatarPlaceholder.jsx'

describe('ProfileAvatarPlaceholder', () => {
  it('renders uppercase initials for a username', () => {
    render(<ProfileAvatarPlaceholder username="jane_doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders "?" when no username or name is provided', () => {
    render(<ProfileAvatarPlaceholder />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('applies custom size classes', () => {
    const { container } = render(<ProfileAvatarPlaceholder size="sm" username="alice" />)
    expect(container.firstChild).toHaveClass('h-8')
    expect(container.firstChild).toHaveClass('w-8')
  })
})
