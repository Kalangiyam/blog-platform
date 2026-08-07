import { apiClient } from '../../../lib/apiClient.js'

export async function getCommentModerationList({ page = 1, is_deleted, signal } = {}) {
  const params = { page }
  if (typeof is_deleted === 'boolean') {
    params.is_deleted = is_deleted
  }

  const response = await apiClient.get('/editorial/comments/', {
    params,
    signal,
  })

  return response.data
}

export async function deleteCommentModeration(id, { signal } = {}) {
  await apiClient.delete(`/comments/${id}/`, { signal })
  return true
}

export async function restoreCommentModeration(id, { signal } = {}) {
  const response = await apiClient.post(`/editorial/comments/${id}/restore/`, {}, { signal })
  return response.data
}
