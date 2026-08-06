import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  removePostFeaturedImage,
  uploadPostFeaturedImage,
} from '../api/mediaApi.js'
import { useFeaturedImageUpload } from './useFeaturedImageUpload.js'

vi.mock('../api/mediaApi.js', () => ({
  uploadPostFeaturedImage: vi.fn(),
  removePostFeaturedImage: vi.fn(),
}))

describe('useFeaturedImageUpload', () => {
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    vi.clearAllMocks()
    URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-blob')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })

  it('initializes with default idle state', () => {
    const { result } = renderHook(() =>
      useFeaturedImageUpload({
        initialImageUrl: 'http://example.com/initial.jpg',
        postSlug: 'my-post',
      }),
    )

    expect(result.current.status).toBe('idle')
    expect(result.current.previewUrl).toBe('http://example.com/initial.jpg')
    expect(result.current.isLocalPreview).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.hasImage).toBe(true)
  })

  it('selects valid file and creates Object URL preview', async () => {
    const { result } = renderHook(() =>
      useFeaturedImageUpload({ postSlug: 'my-post' }),
    )

    const file = new File(['valid'], 'hero.png', { type: 'image/png' })

    await act(async () => {
      await result.current.selectFile(file)
    })

    expect(result.current.selectedFile).toBe(file)
    expect(result.current.previewUrl).toBe('blob:http://localhost/mock-blob')
    expect(result.current.isLocalPreview).toBe(true)
    expect(URL.createObjectURL).toHaveBeenCalledWith(file)
  })

  it('rejects invalid file size and sets normalized error state', async () => {
    const { result } = renderHook(() =>
      useFeaturedImageUpload({ postSlug: 'my-post' }),
    )

    const largeBuffer = new ArrayBuffer(5 * 1024 * 1024 + 1)
    const file = new File([largeBuffer], 'too-large.jpg', { type: 'image/jpeg' })

    await act(async () => {
      await result.current.selectFile(file)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error.message).toBe('Image size must not exceed 5 MB.')
    expect(result.current.selectedFile).toBeNull()
  })

  it('uploads selected file successfully and calls onUploadSuccess', async () => {
    const onUploadSuccess = vi.fn()
    uploadPostFeaturedImage.mockResolvedValueOnce({
      featured_image_url: 'http://example.com/uploaded.jpg',
    })

    const { result } = renderHook(() =>
      useFeaturedImageUpload({ postSlug: 'my-post', onUploadSuccess }),
    )

    const file = new File(['valid'], 'hero.jpg', { type: 'image/jpeg' })

    await act(async () => {
      await result.current.selectFile(file)
    })

    await act(async () => {
      await result.current.upload()
    })

    expect(uploadPostFeaturedImage).toHaveBeenCalledWith(
      'my-post',
      file,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(result.current.status).toBe('success')
    expect(result.current.previewUrl).toBe('http://example.com/uploaded.jpg')
    expect(result.current.isLocalPreview).toBe(false)
    expect(onUploadSuccess).toHaveBeenCalledWith('http://example.com/uploaded.jpg')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-blob')
  })

  it('removes image successfully and calls onRemoveSuccess', async () => {
    const onRemoveSuccess = vi.fn()
    removePostFeaturedImage.mockResolvedValueOnce()

    const { result } = renderHook(() =>
      useFeaturedImageUpload({
        initialImageUrl: 'http://example.com/existing.jpg',
        postSlug: 'my-post',
        onRemoveSuccess,
      }),
    )

    await act(async () => {
      await result.current.remove()
    })

    expect(removePostFeaturedImage).toHaveBeenCalledWith(
      'my-post',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(result.current.previewUrl).toBeNull()
    expect(result.current.hasImage).toBe(false)
    expect(onRemoveSuccess).toHaveBeenCalled()
  })
})
