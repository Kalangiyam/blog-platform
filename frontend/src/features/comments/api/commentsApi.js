import { apiClient } from '../../../lib/apiClient.js'
import { normalizeCommentError } from '../utils/commentErrors.js'

export const COMMENTS_PAGE_SIZE = 20

export async function getPostComments(postSlug, page = 1, { signal } = {}) {
  try {
    const response = await apiClient.get(
      `/posts/${encodeURIComponent(postSlug)}/comments/`,
      {
        params: { page },
        signal,
      },
    )

    return response.data
  } catch (error) {
    throw normalizeCommentError(error, 'list')
  }
}

export async function createPostComment(
  postSlug,
  { content },
  { signal } = {},
) {
  try {
    const response = await apiClient.post(
      `/posts/${encodeURIComponent(postSlug)}/comments/`,
      { content },
      { signal },
    )

    return response.data
  } catch (error) {
    throw normalizeCommentError(error, 'create')
  }
}

export async function updateComment(commentId, { content }, { signal } = {}) {
  try {
    const response = await apiClient.patch(
      `/comments/${encodeURIComponent(commentId)}/`,
      { content },
      { signal },
    )

    return response.data
  } catch (error) {
    throw normalizeCommentError(error, 'update')
  }
}

export async function deleteComment(commentId, { signal } = {}) {
  try {
    await apiClient.delete(`/comments/${encodeURIComponent(commentId)}/`, {
      signal,
    })

    return true
  } catch (error) {
    throw normalizeCommentError(error, 'delete')
  }
}
