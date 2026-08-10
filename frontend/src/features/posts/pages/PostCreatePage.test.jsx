import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as usePostMutationsModule from '../hooks/usePostMutations.js'
import * as useTaxonomiesModule from '../hooks/useTaxonomies.js'
import PostCreatePage from './PostCreatePage.jsx'

vi.mock('../hooks/usePostMutations.js')
vi.mock('../hooks/useTaxonomies.js')

describe('PostCreatePage', () => {
  beforeEach(() => {
    vi.mocked(useTaxonomiesModule.useTaxonomies).mockReturnValue({
      categories: [],
      tags: [],
      loading: false,
      error: null,
    })
    vi.mocked(usePostMutationsModule.usePostMutations).mockReturnValue({
      handleCreatePost: vi.fn(),
      isSubmitting: false,
      error: null,
    })
  })

  it('renders create post header and form', () => {
    render(
      <MemoryRouter>
        <PostCreatePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Create New Post' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeInTheDocument()
  })
})
