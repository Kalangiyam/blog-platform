import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FeaturedImageUploader from './FeaturedImageUploader.jsx'

describe('FeaturedImageUploader', () => {
  it('renders empty state when no image is present', () => {
    render(<FeaturedImageUploader />)
    expect(screen.getByText('No featured image selected. (JPEG, PNG, WebP up to 5MB)')).toBeInTheDocument()
    expect(screen.getByText('Select Image')).toBeInTheDocument()
  })

  it('renders image preview and remove button when image exists', () => {
    const onRemove = vi.fn()
    render(
      <FeaturedImageUploader
        currentImageUrl="https://cdn.example/test.webp"
        onRemove={onRemove}
      />,
    )

    expect(screen.getByAltText('Featured post preview')).toBeInTheDocument()
    expect(screen.getByText('Remove Image')).toBeInTheDocument()
  })
})
