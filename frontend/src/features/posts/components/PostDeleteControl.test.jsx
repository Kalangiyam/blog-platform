import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PostDeleteControl from './PostDeleteControl.jsx'

describe('PostDeleteControl', () => {
  it('opens confirmation modal and triggers onDelete', async () => {
    const onDelete = vi.fn()
    render(<PostDeleteControl postTitle="My Awesome Post" onDelete={onDelete} />)

    expect(screen.getByRole('button', { name: 'Delete Post' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete Post' }))

    expect(screen.getByText('Confirm Soft Deletion')).toBeInTheDocument()
    expect(screen.getByText(/My Awesome Post/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Delete' }))
    expect(onDelete).toHaveBeenCalled()
  })
})
