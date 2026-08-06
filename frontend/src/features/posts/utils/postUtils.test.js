import { AxiosError, CanceledError } from 'axios'
import { describe, expect, it } from 'vitest'

import { formatPostDate } from './postDates.js'
import { normalizePostError, POST_ERROR_CODES, PostError } from './postErrors.js'
import { getSafePostImageUrl } from './postMedia.js'
import {
  getPostsSearch,
  getVisiblePostPages,
  isCanonicalPostsSearch,
  parsePostsPage,
} from './postPagination.js'

describe('post page URL utilities', () => {
  it.each([
    ['', 1],
    ['page=1', 1],
    ['page=2', 2],
    ['page=0', 1],
    ['page=-1', 1],
    ['page=1.5', 1],
    ['page=text', 1],
    ['page=2&page=3', 1],
    ['page=9007199254740992', 1],
  ])('normalizes %s to page %i', (query, expected) => {
    expect(parsePostsPage(new URLSearchParams(query))).toBe(expected)
  })

  it('creates canonical searches and removes unsupported query noise', () => {
    expect(getPostsSearch(1)).toBe('')
    expect(getPostsSearch(4)).toBe('?page=4')
    expect(isCanonicalPostsSearch(new URLSearchParams('page=4'), 4)).toBe(true)
    expect(isCanonicalPostsSearch(new URLSearchParams('page=4&noise=x'), 4)).toBe(false)
  })

  it('builds bounded direct-page navigation with ellipses', () => {
    expect(getVisiblePostPages(5, 10)).toEqual([1, 'ellipsis-1', 4, 5, 6, 'ellipsis-6', 10])
  })
})

describe('post presentation utilities', () => {
  it('formats valid dates predictably and controls invalid dates', () => {
    expect(formatPostDate('2026-01-02T23:00:00+05:30')).toBe('January 2, 2026')
    expect(formatPostDate('not-a-date')).toBe('Date unavailable')
  })

  it('allows only credential-free absolute HTTP image URLs', () => {
    expect(getSafePostImageUrl('https://cdn.example/post.webp')).toBe('https://cdn.example/post.webp')
    expect(getSafePostImageUrl('javascript:alert(1)')).toBeNull()
    expect(getSafePostImageUrl('data:image/svg+xml,bad')).toBeNull()
    expect(getSafePostImageUrl('/media/post.webp')).toBeNull()
    expect(getSafePostImageUrl('https://user:pass@example.test/image')).toBeNull()
  })
})

describe('post error normalization', () => {
  it('distinguishes cancellation and network failures', () => {
    expect(normalizePostError(new CanceledError(), 'list').code).toBe(POST_ERROR_CODES.CANCELLED)
    expect(normalizePostError(new AxiosError('network'), 'list').code).toBe(POST_ERROR_CODES.NETWORK)
  })

  it('distinguishes client and server failures', () => {
    const create = (status) => new AxiosError('private', undefined, {}, {}, { status, data: {}, headers: {}, config: {} })
    expect(normalizePostError(create(400)).code).toBe(POST_ERROR_CODES.CLIENT)
    const serverError = normalizePostError(create(503))
    expect(serverError).toBeInstanceOf(PostError)
    expect(serverError.code).toBe(POST_ERROR_CODES.SERVER)
  })
})
