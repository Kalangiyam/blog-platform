import { apiClient } from '../../../lib/apiClient.js'
import { normalizeCommentError } from '../../comments/utils/commentErrors.js'

export async function getCommentModerationList({ page = 1, is_deleted, signal } = {}) {
  const params = { page }
  if (typeof is_deleted === 'boolean') {
    params.is_deleted = is_deleted
  }

  try {
    const response = await apiClient.get('/editorial/comments/', {
      params,
      signal,
    })

    return response.data
  } catch (error) {
    throw normalizeCommentError(error, 'list')
  }
}

export async function deleteCommentModeration(id, { signal } = {}) {
  try {
    await apiClient.delete(`/editorial/comments/${encodeURIComponent(id)}/`, { signal })
    return true
  } catch (error) {
    throw normalizeCommentError(error, 'delete')
  }
}

export async function restoreCommentModeration(id, { signal } = {}) {
  try {
    const response = await apiClient.post(
      `/editorial/comments/${encodeURIComponent(id)}/restore/`,
      {},
      { signal },
    )
    return response.data
  } catch (error) {
    throw normalizeCommentError(error, 'restore')
  }
}
