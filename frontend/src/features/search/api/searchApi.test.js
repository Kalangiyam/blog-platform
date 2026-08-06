import AxiosMockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { apiClient } from '../../../lib/apiClient.js'
import { SEARCH_ERROR_CODES, SearchError } from '../utils/searchErrors.js'
import { searchPosts } from './searchApi.js'

describe('searchApi', () => {
  let mock

  beforeEach(() => {
    mock = new AxiosMockAdapter(apiClient)
  })

  afterEach(() => {
    mock.restore()
  })

  it('returns empty result structure without making network request for blank query', async () => {
    const result = await searchPosts('')
    expect(result).toEqual({
      count: 0,
      next: null,
      previous: null,
      results: [],
    })
    expect(mock.history.get.length).toBe(0)
  })

  it('calls /posts/search/ with q parameter on page 1', async () => {
    const mockData = {
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1, title: 'Django Rules', slug: 'django-rules' }],
    }

    mock.onGet('/posts/search/').reply((config) => {
      expect(config.params).toEqual({ q: 'django' })
      return [200, mockData]
    })

    const result = await searchPosts('  django  ', 1)
    expect(result).toEqual(mockData)
  })

  it('includes page parameter when page > 1', async () => {
    const mockData = {
      count: 15,
      next: null,
      previous: 'http://localhost/api/posts/search/?page=1&q=django',
      results: [{ id: 11, title: 'Django Advanced', slug: 'django-advanced' }],
    }

    mock.onGet('/posts/search/').reply((config) => {
      expect(config.params).toEqual({ q: 'django', page: 2 })
      return [200, mockData]
    })

    const result = await searchPosts('django', 2)
    expect(result).toEqual(mockData)
  })

  it('normalizes error response on 400 validation error', async () => {
    mock.onGet('/posts/search/').reply(400, { q: ['Ensure this field has at least 2 characters.'] })

    await expect(searchPosts('a')).rejects.toSatisfy((err) => {
      return err instanceof SearchError && err.code === SEARCH_ERROR_CODES.INVALID_QUERY
    })
  })

  it('normalizes 404 page out of range error', async () => {
    mock.onGet('/posts/search/').reply(404, { detail: 'Invalid page.' })

    await expect(searchPosts('django', 99)).rejects.toSatisfy((err) => {
      return err instanceof SearchError && err.code === SEARCH_ERROR_CODES.INVALID_PAGE
    })
  })
})
