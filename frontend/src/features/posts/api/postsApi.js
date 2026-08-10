import { apiClient } from '../../../lib/apiClient.js'
import { normalizePostError } from '../utils/postErrors.js'

export const POSTS_PAGE_SIZE = 20

export async function getPublishedPosts(page = 1, options = {}) {
  try {
    const { signal, category, tag, search, pageSize } = options
    const params = { page }
    if (category) params.category = category
    if (tag) params.tag = tag
    if (search) params.search = search
    if (pageSize) params.page_size = pageSize

    const response = await apiClient.get('/posts/', {
      params,
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

export async function getEditorialPost(slug, { signal } = {}) {
  try {
    const response = await apiClient.get(
      `/editorial/posts/${encodeURIComponent(slug)}/`,
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

export async function getCategories(page = 1, { signal } = {}) {
  try {
    const response = await apiClient.get('/categories/', { params: { page }, signal })
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'categories')
  }
}

export async function getCategoryBySlug(slug, { signal } = {}) {
  try {
    const response = await apiClient.get(`/categories/${encodeURIComponent(slug)}/`, { signal })
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'category_detail')
  }
}

export async function getTags(page = 1, { signal } = {}) {
  try {
    const response = await apiClient.get('/tags/', { params: { page }, signal })
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'tags')
  }
}

export async function getTagBySlug(slug, { signal } = {}) {
  try {
    const response = await apiClient.get(`/tags/${encodeURIComponent(slug)}/`, { signal })
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'tag_detail')
  }
}
