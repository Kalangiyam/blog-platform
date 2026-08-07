import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as useTaxonomiesModule from '../hooks/useTaxonomies.js'
import PostForm from './PostForm.jsx'

vi.mock('../hooks/useTaxonomies.js')

describe('PostForm', () => {
  beforeEach(() => {
    vi.mocked(useTaxonomiesModule.useTaxonomies).mockReturnValue({
      categories: [{ name: 'Tech', slug: 'tech' }],
      tags: [{ name: 'React', slug: 'react' }],
      loading: false,
      error: null,
    })
  })

  it('renders input fields and submits valid form data', async () => {
    const onSubmit = vi.fn()
    render(<PostForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'New Test Post' },
    })
    fireEvent.change(screen.getByLabelText(/Content/i), {
      target: { value: 'This is the test content body.' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Draft Post' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New Test Post',
      excerpt: '',
      content: 'This is the test content body.',
      category_slugs: [],
      tag_slugs: [],
    })
  })

  it('displays client validation errors when submitting empty required fields', () => {
    const onSubmit = vi.fn()
    render(<PostForm onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Create Draft Post' }))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('Content is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
