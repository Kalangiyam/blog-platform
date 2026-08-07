import { apiClient } from '../../../lib/apiClient.js'
import { normalizePostError } from '../../posts/utils/postErrors.js'

export async function getEditorialPosts({ page = 1, status, is_deleted, signal } = {}) {
  try {
    const params = { page }
    if (status) {
      params.status = status
    }
    if (typeof is_deleted === 'boolean') {
      params.is_deleted = is_deleted
    }

    const response = await apiClient.get('/editorial/posts/', {
      params,
      signal,
    })

    return response.data
  } catch (error) {
    throw normalizePostError(error, 'list')
  }
}

export async function restoreEditorialPost(slug, { signal } = {}) {
  try {
    const response = await apiClient.post(
      `/editorial/posts/${encodeURIComponent(slug)}/restore/`,
      {},
      { signal },
    )
    return response.data
  } catch (error) {
    throw normalizePostError(error, 'restore')
  }
}
