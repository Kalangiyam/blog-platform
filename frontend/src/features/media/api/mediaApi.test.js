import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '../../../lib/apiClient.js'
import { MEDIA_ERROR_CODES } from '../utils/normalizeMediaError.js'
import {
  removePostFeaturedImage,
  uploadPostFeaturedImage,
} from './mediaApi.js'

vi.mock('../../../lib/apiClient.js', () => ({
  apiClient: {
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('mediaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uploadPostFeaturedImage', () => {
    it('sends a PUT request with multipart FormData and returns featured_image_url', async () => {
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const mockResponse = { data: { featured_image_url: 'http://example.com/media/test.jpg' } }

      apiClient.put.mockResolvedValueOnce(mockResponse)

      const onUploadProgress = vi.fn()
      const controller = new AbortController()

      const result = await uploadPostFeaturedImage('my-post-slug', mockFile, {
        onUploadProgress,
        signal: controller.signal,
      })

      expect(apiClient.put).toHaveBeenCalledWith(
        '/posts/my-post-slug/featured-image/',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress,
          signal: controller.signal,
        },
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('normalizes backend validation errors from PUT request', async () => {
      const mockFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      const mockError = {
        response: {
          status: 400,
          data: { image: ['Image size must not exceed 5 MB.'] },
        },
      }

      apiClient.put.mockRejectedValueOnce(mockError)

      await expect(
        uploadPostFeaturedImage('my-post-slug', mockFile),
      ).rejects.toMatchObject({
        code: MEDIA_ERROR_CODES.VALIDATION_ERROR,
        message: 'Image size must not exceed 5 MB.',
      })
    })
  })

  describe('removePostFeaturedImage', () => {
    it('sends a DELETE request to featured-image endpoint', async () => {
      apiClient.delete.mockResolvedValueOnce({ status: 204, data: null })

      await removePostFeaturedImage('my-post-slug')

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/posts/my-post-slug/featured-image/',
        { signal: undefined },
      )
    })

    it('normalizes forbidden 403 error on DELETE request', async () => {
      const mockError = {
        response: {
          status: 403,
          data: { detail: 'Only author can remove featured image.' },
        },
      }

      apiClient.delete.mockRejectedValueOnce(mockError)

      await expect(
        removePostFeaturedImage('my-post-slug'),
      ).rejects.toMatchObject({
        code: MEDIA_ERROR_CODES.FORBIDDEN,
      })
    })
  })
})
