import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PostPublishControl from './PostPublishControl.jsx'

describe('PostPublishControl', () => {
  it('renders Publish button for draft and triggers confirmation', async () => {
    const onPublish = vi.fn()
    render(<PostPublishControl status="draft" onPublish={onPublish} />)

    expect(screen.getByText('Publish Post')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Publish Post'))

    expect(screen.getByText('Publish post now?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Confirm'))

    expect(onPublish).toHaveBeenCalled()
  })

  it('renders Unpublish button for published and triggers confirmation', async () => {
    const onUnpublish = vi.fn()
    render(<PostPublishControl status="published" onUnpublish={onUnpublish} />)

    expect(screen.getByText('Unpublish Post')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Unpublish Post'))

    expect(screen.getByText('Unpublish post?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Confirm'))

    expect(onUnpublish).toHaveBeenCalled()
  })
})
