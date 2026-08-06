import { describe, expect, it } from 'vitest'

import {
  normalizeSearchError,
  SEARCH_ERROR_CODES,
  SearchError,
} from './searchErrors.js'

describe('searchErrors', () => {
  it('returns SearchError instance unchanged', () => {
    const error = new SearchError(SEARCH_ERROR_CODES.SERVER)
    expect(normalizeSearchError(error)).toBe(error)
  })

  it('normalizes cancelled requests', () => {
    const cancelError = { name: 'CanceledError', code: 'ERR_CANCELED' }
    const result = normalizeSearchError(cancelError)
    expect(result).toBeInstanceOf(SearchError)
    expect(result.code).toBe(SEARCH_ERROR_CODES.CANCELLED)
  })

  it('normalizes network errors without response', () => {
    const networkError = new Error('Network Error')
    const result = normalizeSearchError(networkError)
    expect(result).toBeInstanceOf(SearchError)
    expect(result.code).toBe(SEARCH_ERROR_CODES.NETWORK)
  })

  it('normalizes 400 validation error for query parameter q', () => {
    const badRequestError = {
      response: {
        status: 400,
        data: { q: ['Ensure this field has at least 2 characters.'] },
      },
    }
    const result = normalizeSearchError(badRequestError)
    expect(result).toBeInstanceOf(SearchError)
    expect(result.code).toBe(SEARCH_ERROR_CODES.INVALID_QUERY)
    expect(result.detail).toEqual(['Ensure this field has at least 2 characters.'])
  })

  it('normalizes 404 page out of range error', () => {
    const notFoundError = {
      response: {
        status: 404,
        data: { detail: 'Invalid page.' },
      },
    }
    const result = normalizeSearchError(notFoundError)
    expect(result).toBeInstanceOf(SearchError)
    expect(result.code).toBe(SEARCH_ERROR_CODES.INVALID_PAGE)
  })

  it('normalizes 500 server error', () => {
    const serverError = {
      response: {
        status: 500,
        data: { detail: 'Internal Server Error' },
      },
    }
    const result = normalizeSearchError(serverError)
    expect(result).toBeInstanceOf(SearchError)
    expect(result.code).toBe(SEARCH_ERROR_CODES.SERVER)
  })
})
