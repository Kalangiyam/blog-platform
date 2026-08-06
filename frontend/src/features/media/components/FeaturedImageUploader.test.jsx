import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  removePostFeaturedImage,
  uploadPostFeaturedImage,
} from '../api/mediaApi.js'
import FeaturedImageUploader from './FeaturedImageUploader.jsx'

vi.mock('../api/mediaApi.js', () => ({
  uploadPostFeaturedImage: vi.fn(),
  removePostFeaturedImage: vi.fn(),
}))

describe('FeaturedImageUploader', () => {
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    vi.clearAllMocks()
    URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-preview')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('renders dropzone when post has no featured image', () => {
    render(<FeaturedImageUploader postSlug="my-post" />)

    expect(screen.getByText('Post Featured Image')).toBeInTheDocument()
    expect(screen.getByText('Click or drag image to upload')).toBeInTheDocument()
    expect(screen.queryByLabelText('Remove featured image')).not.toBeInTheDocument()
  })

  it('renders initial image preview and remove button when initialImageUrl is provided', () => {
    render(
      <FeaturedImageUploader
        initialImageUrl="http://example.com/hero.jpg"
        postSlug="my-post"
      />,
    )

    expect(screen.getByAltText('Featured image preview')).toBeInTheDocument()
    expect(screen.getByLabelText('Remove featured image')).toBeInTheDocument()
  })

  it('allows file selection, shows draft preview, and uploads on confirm', async () => {
    const onUploadSuccess = vi.fn()
    uploadPostFeaturedImage.mockResolvedValueOnce({
      featured_image_url: 'http://example.com/new-hero.jpg',
    })

    render(
      <FeaturedImageUploader
        onUploadSuccess={onUploadSuccess}
        postSlug="my-post"
      />,
    )

    const file = new File(['valid-image-bytes'], 'banner.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText('Upload featured image').querySelector('input[type="file"]')

    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(await screen.findByText('Draft Preview (Unsaved)')).toBeInTheDocument()
    expect(screen.getByText('Upload Image')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Upload Image'))

    await waitFor(() => {
      expect(uploadPostFeaturedImage).toHaveBeenCalledWith(
        'my-post',
        file,
        expect.any(Object),
      )
      expect(onUploadSuccess).toHaveBeenCalledWith('http://example.com/new-hero.jpg')
    })
  })

  it('removes image when Remove Image button is clicked', async () => {
    const onRemoveSuccess = vi.fn()
    removePostFeaturedImage.mockResolvedValueOnce()

    render(
      <FeaturedImageUploader
        initialImageUrl="http://example.com/hero.jpg"
        onRemoveSuccess={onRemoveSuccess}
        postSlug="my-post"
      />,
    )

    const removeBtn = screen.getByLabelText('Remove featured image')
    fireEvent.click(removeBtn)

    await waitFor(() => {
      expect(removePostFeaturedImage).toHaveBeenCalledWith('my-post', expect.any(Object))
      expect(onRemoveSuccess).toHaveBeenCalled()
    })
  })
})
