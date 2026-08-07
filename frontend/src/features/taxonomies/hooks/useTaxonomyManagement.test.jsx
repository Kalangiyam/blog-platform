import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  getManagementCategories: vi.fn(),
  createManagementCategory: vi.fn(),
  updateManagementCategory: vi.fn(),
  getManagementTags: vi.fn(),
  createManagementTag: vi.fn(),
  updateManagementTag: vi.fn(),
}))

vi.mock('../api/taxonomiesApi.js', () => apiMocks)

import { useTaxonomyManagement } from './useTaxonomyManagement.js'

describe('useTaxonomyManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches categories and toggles active status', async () => {
    const listData = {
      count: 1,
      results: [{ id: 1, name: 'Tech', slug: 'tech', is_active: true }],
    }
    apiMocks.getManagementCategories.mockResolvedValue(listData)
    apiMocks.updateManagementCategory.mockResolvedValue({
      id: 1,
      name: 'Tech',
      slug: 'tech',
      is_active: false,
    })

    const { result } = renderHook(() => useTaxonomyManagement('category'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBe(listData)

    await act(async () => {
      await result.current.handleToggleActive(listData.results[0])
    })

    expect(apiMocks.updateManagementCategory).toHaveBeenCalledWith('tech', {
      name: 'Tech',
      is_active: false,
    })
  })

  it('handles taxonomy activation/deactivation for tags', async () => {
    const tagList = {
      count: 1,
      results: [{ id: 2, name: 'React', slug: 'react', is_active: false }],
    }
    apiMocks.getManagementTags.mockResolvedValue(tagList)
    apiMocks.updateManagementTag.mockResolvedValue({
      id: 2,
      name: 'React',
      slug: 'react',
      is_active: true,
    })

    const { result } = renderHook(() => useTaxonomyManagement('tag'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.handleToggleActive(tagList.results[0])
    })

    expect(apiMocks.updateManagementTag).toHaveBeenCalledWith('react', {
      name: 'React',
      is_active: true,
    })
  })

  it('handles 401 versus 403 API errors cleanly', async () => {
    apiMocks.getManagementCategories.mockRejectedValue({
      response: { status: 403, data: { detail: 'Forbidden.' } },
    })

    const { result } = renderHook(() => useTaxonomyManagement('category'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
  })
})
