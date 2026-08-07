import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiClientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('../../../lib/apiClient.js', () => ({ apiClient: apiClientMocks }))

import {
  createManagementCategory,
  createManagementTag,
  getManagementCategories,
  getManagementTags,
  updateManagementCategory,
  updateManagementTag,
} from './taxonomiesApi.js'

describe('taxonomiesApi', () => {
  beforeEach(() => {
    apiClientMocks.get.mockReset()
    apiClientMocks.post.mockReset()
    apiClientMocks.patch.mockReset()
  })

  it('fetches management categories with pagination', async () => {
    const data = { count: 1, results: [{ name: 'Tech', slug: 'tech' }] }
    apiClientMocks.get.mockResolvedValue({ data })

    const result = await getManagementCategories({ page: 2 })
    expect(result).toBe(data)
    expect(apiClientMocks.get).toHaveBeenCalledWith('/editorial/categories/', {
      params: { page: 2 },
      signal: undefined,
    })
  })

  it('creates management category', async () => {
    const newCat = { name: 'Health', is_active: true }
    apiClientMocks.post.mockResolvedValue({ data: { id: 1, ...newCat } })

    const result = await createManagementCategory(newCat)
    expect(result).toEqual({ id: 1, ...newCat })
    expect(apiClientMocks.post).toHaveBeenCalledWith('/editorial/categories/', newCat, {
      signal: undefined,
    })
  })

  it('updates management category active status', async () => {
    apiClientMocks.patch.mockResolvedValue({ data: { slug: 'tech', is_active: false } })

    await updateManagementCategory('tech', { name: 'Tech', is_active: false })
    expect(apiClientMocks.patch).toHaveBeenCalledWith(
      '/editorial/categories/tech/',
      { name: 'Tech', is_active: false },
      { signal: undefined },
    )
  })

  it('fetches management tags and creates new tag', async () => {
    const tagsData = { count: 1, results: [{ name: 'React', slug: 'react' }] }
    apiClientMocks.get.mockResolvedValue({ data: tagsData })

    await getManagementTags({ page: 1 })
    expect(apiClientMocks.get).toHaveBeenCalledWith('/editorial/tags/', {
      params: { page: 1 },
      signal: undefined,
    })

    const newTag = { name: 'Vue', is_active: true }
    apiClientMocks.post.mockResolvedValue({ data: { id: 2, ...newTag } })
    await createManagementTag(newTag)
    expect(apiClientMocks.post).toHaveBeenCalledWith('/editorial/tags/', newTag, {
      signal: undefined,
    })

    apiClientMocks.patch.mockResolvedValue({ data: { slug: 'react', is_active: false } })
    await updateManagementTag('react', { name: 'React', is_active: false })
    expect(apiClientMocks.patch).toHaveBeenCalledWith(
      '/editorial/tags/react/',
      { name: 'React', is_active: false },
      { signal: undefined },
    )
  })
})
