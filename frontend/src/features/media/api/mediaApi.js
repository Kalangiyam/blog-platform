import { apiClient } from '../../../lib/apiClient.js'
import { normalizeMediaError } from '../utils/normalizeMediaError.js'

/**
 * Uploads or replaces the featured image for a post.
 *
 * @param {string} slug - The post slug.
 * @param {File} file - The image file to upload.
 * @param {object} [options]
 * @param {function} [options.onUploadProgress] - Axios upload progress callback.
 * @param {AbortSignal} [options.signal] - AbortSignal for request cancellation.
 * @returns {Promise<{ featured_image_url: string|null }>}
 */
export async function uploadPostFeaturedImage(
  slug,
  file,
  { onUploadProgress, signal } = {},
) {
  if (!slug) {
    throw normalizeMediaError(new Error('Post slug is required for featured image upload.'))
  }

  if (!file) {
    throw normalizeMediaError(new Error('Image file is required for upload.'))
  }

  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await apiClient.put(
      `/posts/${encodeURIComponent(slug)}/featured-image/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
        signal,
      },
    )

    return response.data
  } catch (error) {
    throw normalizeMediaError(error)
  }
}

/**
 * Removes the featured image from a post.
 *
 * @param {string} slug - The post slug.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - AbortSignal for request cancellation.
 * @returns {Promise<void>}
 */
export async function removePostFeaturedImage(slug, { signal } = {}) {
  if (!slug) {
    throw normalizeMediaError(new Error('Post slug is required for featured image removal.'))
  }

  try {
    await apiClient.delete(
      `/posts/${encodeURIComponent(slug)}/featured-image/`,
      { signal },
    )
  } catch (error) {
    throw normalizeMediaError(error)
  }
}
