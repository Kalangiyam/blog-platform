import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import UserRoleBadge from './UserRoleBadge.jsx'

describe('UserRoleBadge', () => {
  it('renders Author role badge', () => {
    render(<UserRoleBadge role="Author" />)
    expect(screen.getByText('Author')).toBeInTheDocument()
  })

  it('renders Editor role badge', () => {
    render(<UserRoleBadge role="Editor" />)
    expect(screen.getByText('Editor')).toBeInTheDocument()
  })

  it('renders Administrator role badge', () => {
    render(<UserRoleBadge role="Administrator" />)
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })
})
