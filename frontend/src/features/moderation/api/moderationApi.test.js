import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiClientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  delete: vi.fn(),
  post: vi.fn(),
}))

vi.mock('../../../lib/apiClient.js', () => ({ apiClient: apiClientMocks }))

import {
  deleteCommentModeration,
  getCommentModerationList,
  restoreCommentModeration,
} from './moderationApi.js'

describe('moderationApi', () => {
  beforeEach(() => {
    apiClientMocks.get.mockReset()
    apiClientMocks.delete.mockReset()
    apiClientMocks.post.mockReset()
  })

  it('fetches comment moderation list with parameters', async () => {
    const data = { count: 1, results: [{ id: 5, content: 'Comment 5' }] }
    apiClientMocks.get.mockResolvedValue({ data })

    const result = await getCommentModerationList({ page: 1, is_deleted: true })
    expect(result).toBe(data)
    expect(apiClientMocks.get).toHaveBeenCalledWith('/editorial/comments/', {
      params: { page: 1, is_deleted: true },
      signal: undefined,
    })
  })

  it('deletes comment via public moderation endpoint', async () => {
    apiClientMocks.delete.mockResolvedValue({})

    const res = await deleteCommentModeration(10)
    expect(res).toBe(true)
    expect(apiClientMocks.delete).toHaveBeenCalledWith('/comments/10/', {
      signal: undefined,
    })
  })

  it('restores soft-deleted comment via editorial endpoint', async () => {
    const restored = { id: 10, is_deleted: false }
    apiClientMocks.post.mockResolvedValue({ data: restored })

    const res = await restoreCommentModeration(10)
    expect(res).toBe(restored)
    expect(apiClientMocks.post).toHaveBeenCalledWith('/editorial/comments/10/restore/', {}, {
      signal: undefined,
    })
  })
})
