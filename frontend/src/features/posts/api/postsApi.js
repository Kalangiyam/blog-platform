import { apiClient } from '../../../lib/apiClient.js'
import { normalizePostError } from '../utils/postErrors.js'

export const POSTS_PAGE_SIZE = 20

export async function getPublishedPosts(page = 1, { signal } = {}) {
  try {
    const response = await apiClient.get('/posts/', {
      params: { page },
      signal,
    })

    return response.data
  } catch (error) {
    throw normalizePostError(error, 'list')
  }
}

export async function getPublishedPost(slug, { signal } = {}) {
  try {
    const response = await apiClient.get(
      `/posts/${encodeURIComponent(slug)}/`,
      { signal },
    )

    return response.data
  } catch (error) {
    throw normalizePostError(error, 'detail')
  }
}

export async function createPost(postData, { signal } = {}) {
  try {
    const response = await apiClient.post('/posts/', postData, { signal })
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'create')
  }
}

export async function updatePost(slug, postData, { signal } = {}) {
  try {
    const response = await apiClient.patch(
      `/posts/${encodeURIComponent(slug)}/`,
      postData,
      { signal },
    )
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'update')
  }
}

export async function deletePost(slug, { signal } = {}) {
  try {
    await apiClient.delete(`/posts/${encodeURIComponent(slug)}/`, { signal })
    return true
  } catch (error) {
    throw normalizePostError(error, 'delete')
  }
}

export async function publishPost(slug, { signal } = {}) {
  try {
    const response = await apiClient.post(
      `/posts/${encodeURIComponent(slug)}/publish/`,
      {},
      { signal },
    )
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'publish')
  }
}

export async function unpublishPost(slug, { signal } = {}) {
  try {
    const response = await apiClient.post(
      `/posts/${encodeURIComponent(slug)}/unpublish/`,
      {},
      { signal },
    )
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'unpublish')
  }
}

export async function uploadFeaturedImage(slug, imageFile, { signal } = {}) {
  try {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await apiClient.put(
      `/posts/${encodeURIComponent(slug)}/featured-image/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal,
      },
    )
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'featured_image_upload')
  }
}

export async function removeFeaturedImage(slug, { signal } = {}) {
  try {
    await apiClient.delete(
      `/posts/${encodeURIComponent(slug)}/featured-image/`,
      { signal },
    )
    return true
  } catch (error) {
    throw normalizePostError(error, 'featured_image_remove')
  }
}

export async function getCategories({ signal } = {}) {
  try {
    const response = await apiClient.get('/categories/', { signal })
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'categories')
  }
}

export async function getTags({ signal } = {}) {
  try {
    const response = await apiClient.get('/tags/', { signal })
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'tags')
  }
}

