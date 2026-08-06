import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiClientMocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('../../../lib/apiClient.js', () => ({ apiClient: apiClientMocks }))

import { getPublishedPost, getPublishedPosts } from './postsApi.js'
import { POST_ERROR_CODES } from '../utils/postErrors.js'

function axiosError(status) {
  return new AxiosError('private backend detail', undefined, {}, {}, {
    status,
    data: { detail: 'internal detail' },
    headers: {},
    config: {},
  })
}

describe('public posts API', () => {
  beforeEach(() => apiClientMocks.get.mockReset())

  it('requests an exact public list page and returns the response body', async () => {
    const body = { count: 1, next: null, previous: null, results: [{ id: 1 }] }
    const controller = new AbortController()
    apiClientMocks.get.mockResolvedValue({ data: body })

    await expect(getPublishedPosts(3, { signal: controller.signal })).resolves.toBe(body)
    expect(apiClientMocks.get).toHaveBeenCalledWith('/posts/', {
      params: { page: 3 },
      signal: controller.signal,
    })
  })

  it('encodes the slug in the exact public detail path', async () => {
    apiClientMocks.get.mockResolvedValue({ data: { id: 2 } })

    await getPublishedPost('safe slug')

    expect(apiClientMocks.get).toHaveBeenCalledWith('/posts/safe%20slug/', {
      signal: undefined,
    })
  })

  it('normalizes list and detail 404 responses by operation', async () => {
    apiClientMocks.get.mockRejectedValueOnce(axiosError(404))
    await expect(getPublishedPosts(99)).rejects.toMatchObject({ code: POST_ERROR_CODES.INVALID_PAGE })

    apiClientMocks.get.mockRejectedValueOnce(axiosError(404))
    await expect(getPublishedPost('missing')).rejects.toMatchObject({ code: POST_ERROR_CODES.NOT_FOUND })
  })

})
