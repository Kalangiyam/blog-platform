import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiClientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('../../../lib/apiClient.js', () => ({ apiClient: apiClientMocks }))

import { getEditorialPosts, restoreEditorialPost } from './dashboardApi.js'

function axiosError(status) {
  return new AxiosError('backend error', undefined, {}, {}, {
    status,
    data: { detail: 'error detail' },
    headers: {},
    config: {},
  })
}

describe('dashboardApi', () => {
  beforeEach(() => {
    apiClientMocks.get.mockReset()
    apiClientMocks.post.mockReset()
  })

  it('requests editorial posts with page, status, and is_deleted filters', async () => {
    const mockData = { count: 1, results: [{ id: 1, title: 'Test Post' }] }
    const controller = new AbortController()
    apiClientMocks.get.mockResolvedValue({ data: mockData })

    const result = await getEditorialPosts({
      page: 2,
      status: 'published',
      is_deleted: true,
      signal: controller.signal,
    })

    expect(result).toBe(mockData)
    expect(apiClientMocks.get).toHaveBeenCalledWith('/editorial/posts/', {
      params: { page: 2, status: 'published', is_deleted: true },
      signal: controller.signal,
    })
  })

  it('restores soft-deleted post with encoded slug', async () => {
    const mockPost = { id: 1, slug: 'my-post', is_deleted: false }
    apiClientMocks.post.mockResolvedValue({ data: mockPost })

    const result = await restoreEditorialPost('my post/special')

    expect(result).toBe(mockPost)
    expect(apiClientMocks.post).toHaveBeenCalledWith(
      '/editorial/posts/my%20post%2Fspecial/restore/',
      {},
      { signal: undefined },
    )
  })

  it('handles error responses safely', async () => {
    apiClientMocks.get.mockRejectedValue(axiosError(403))
    await expect(getEditorialPosts()).rejects.toThrow()
  })
})
