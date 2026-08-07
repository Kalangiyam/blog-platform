import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsApi from '../api/postsApi.js'
import * as usePostMutationsModule from '../hooks/usePostMutations.js'
import * as useTaxonomiesModule from '../hooks/useTaxonomies.js'
import PostEditPage from './PostEditPage.jsx'

vi.mock('../api/postsApi.js')
vi.mock('../hooks/usePostMutations.js')
vi.mock('../hooks/useTaxonomies.js')

describe('PostEditPage', () => {
  beforeEach(() => {
    vi.mocked(useTaxonomiesModule.useTaxonomies).mockReturnValue({
      categories: [],
      tags: [],
      loading: false,
      error: null,
    })
    vi.mocked(usePostMutationsModule.usePostMutations).mockReturnValue({
      handleUpdatePost: vi.fn(),
      handlePublishPost: vi.fn(),
      handleUnpublishPost: vi.fn(),
      handleDeletePost: vi.fn(),
      handleUploadFeaturedImage: vi.fn(),
      handleRemoveFeaturedImage: vi.fn(),
      isSubmitting: false,
      error: null,
    })
  })

  it('renders loading state initially and then edit form when post is fetched', async () => {
    const mockPost = {
      id: 1,
      title: 'Existing Post',
      slug: 'existing-post',
      excerpt: 'Excerpt',
      content: 'Content body',
      status: 'draft',
      categories: [],
      tags: [],
    }

    vi.mocked(postsApi.getPublishedPost).mockResolvedValue(mockPost)

    render(
      <MemoryRouter initialEntries={['/posts/existing-post/edit']}>
        <Routes>
          <Route path="/posts/:postSlug/edit" element={<PostEditPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { level: 1, name: 'Edit Post' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing Post')).toBeInTheDocument()
  })
})
