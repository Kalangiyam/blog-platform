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
