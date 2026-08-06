import { apiClient } from '../../../lib/apiClient.js'
import { normalizeSearchError } from '../utils/searchErrors.js'

export async function searchPosts(query, page = 1, { signal } = {}) {
  const trimmed = (query || '').trim()
  if (!trimmed) {
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    }
  }

  try {
    const params = { q: trimmed }
    if (page > 1) {
      params.page = page
    }

    const response = await apiClient.get('/posts/search/', {
      params,
      signal,
    })

    return response.data
  } catch (error) {
    throw normalizeSearchError(error)
  }
}
