import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import UserStatusBadge from './UserStatusBadge.jsx'

describe('UserStatusBadge', () => {
  it('renders Active badge with accessible label when isActive is true', () => {
    render(<UserStatusBadge isActive={true} />)
    const badge = screen.getByText('Active')
    expect(badge).toBeInTheDocument()
    expect(screen.getByLabelText('Account status: Active')).toBeInTheDocument()
  })

  it('renders Inactive badge with accessible label when isActive is false', () => {
    render(<UserStatusBadge isActive={false} />)
    const badge = screen.getByText('Inactive')
    expect(badge).toBeInTheDocument()
    expect(screen.getByLabelText('Account status: Inactive')).toBeInTheDocument()
  })
})
