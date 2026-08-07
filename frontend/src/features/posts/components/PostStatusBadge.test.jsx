import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PostStatusBadge from './PostStatusBadge.jsx'

describe('PostStatusBadge', () => {
  it('renders Published state', () => {
    render(<PostStatusBadge status="published" />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('renders Draft state', () => {
    render(<PostStatusBadge status="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })
})
