import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  getCommentModerationList: vi.fn(),
  deleteCommentModeration: vi.fn(),
  restoreCommentModeration: vi.fn(),
}))

vi.mock('../api/moderationApi.js', () => apiMocks)

import { useCommentModeration } from './useCommentModeration.js'

describe('useCommentModeration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches comments list and handles comment soft-deletion', async () => {
    const listData = {
      count: 1,
      results: [{ id: 10, content: 'Bad comment', is_deleted: false }],
    }
    apiMocks.getCommentModerationList.mockResolvedValue(listData)
    apiMocks.deleteCommentModeration.mockResolvedValue(true)

    const { result } = renderHook(() => useCommentModeration())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBe(listData)

    await act(async () => {
      await result.current.handleDelete(10)
    })

    expect(apiMocks.deleteCommentModeration).toHaveBeenCalledWith(10)
  })

  it('handles comment restoration and handles 401 versus 403 error responses', async () => {
    const listData = {
      count: 1,
      results: [{ id: 11, content: 'Deleted comment', is_deleted: true }],
    }
    apiMocks.getCommentModerationList.mockResolvedValue(listData)
    apiMocks.restoreCommentModeration.mockResolvedValue({ id: 11, is_deleted: false })

    const { result } = renderHook(() => useCommentModeration())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.handleRestore(11)
    })

    expect(apiMocks.restoreCommentModeration).toHaveBeenCalledWith(11)
  })
})
