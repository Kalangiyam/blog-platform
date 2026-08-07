import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as postsApi from '../api/postsApi.js'
import { usePostMutations } from './usePostMutations.js'

vi.mock('../api/postsApi.js')

describe('usePostMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles post creation successfully', async () => {
    const mockPost = { id: 1, slug: 'test-post', title: 'Test Post' }
    vi.mocked(postsApi.createPost).mockResolvedValue(mockPost)

    const { result } = renderHook(() => usePostMutations())

    let res
    await act(async () => {
      res = await result.current.handleCreatePost({ title: 'Test Post' })
    })

    expect(res).toEqual(mockPost)
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('captures mutation error on failure', async () => {
    const error = new Error('Creation failed')
    vi.mocked(postsApi.createPost).mockRejectedValue(error)

    const { result } = renderHook(() => usePostMutations())

    await act(async () => {
      await expect(result.current.handleCreatePost({ title: 'Test' })).rejects.toThrow('Creation failed')
    })

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.error).toBe(error)

    act(() => {
      result.current.clearError()
    })
    expect(result.current.error).toBeNull()
  })
})
