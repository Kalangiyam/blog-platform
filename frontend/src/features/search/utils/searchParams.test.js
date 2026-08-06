import { describe, expect, it } from 'vitest'

import {
  buildSearchPath,
  getVisibleSearchPages,
  isCanonicalSearchUrl,
  parseSearchPage,
  parseSearchQuery,
} from './searchParams.js'

describe('searchParams', () => {
  describe('parseSearchQuery', () => {
    it('returns empty string when searchParams is missing or q is absent', () => {
      const params = new URLSearchParams()
      expect(parseSearchQuery(params)).toBe('')
    })

    it('trims leading and trailing whitespace', () => {
      const params = new URLSearchParams('q=%20%20django%20rest%20%20')
      expect(parseSearchQuery(params)).toBe('django rest')
    })

    it('returns empty string if multiple q parameters are provided', () => {
      const params = new URLSearchParams('q=django&q=react')
      expect(parseSearchQuery(params)).toBe('')
    })
  })

  describe('parseSearchPage', () => {
    it('returns 1 for missing page param', () => {
      const params = new URLSearchParams('q=django')
      expect(parseSearchPage(params)).toBe(1)
    })

    it('parses valid positive integer page', () => {
      const params = new URLSearchParams('q=django&page=3')
      expect(parseSearchPage(params)).toBe(3)
    })

    it('returns 1 for 0, negative, decimal, or invalid strings', () => {
      expect(parseSearchPage(new URLSearchParams('page=0'))).toBe(1)
      expect(parseSearchPage(new URLSearchParams('page=-5'))).toBe(1)
      expect(parseSearchPage(new URLSearchParams('page=2.5'))).toBe(1)
      expect(parseSearchPage(new URLSearchParams('page=abc'))).toBe(1)
    })
  })

  describe('buildSearchPath', () => {
    it('returns /search for blank or missing query', () => {
      expect(buildSearchPath('')).toBe('/search')
      expect(buildSearchPath('   ')).toBe('/search')
    })

    it('builds canonical URL omitting page=1', () => {
      expect(buildSearchPath('django', 1)).toBe('/search?q=django')
    })

    it('includes page parameter when page > 1', () => {
      expect(buildSearchPath('django rest', 2)).toBe('/search?q=django+rest&page=2')
    })

    it('safely encodes special characters in query', () => {
      expect(buildSearchPath('c++ & python')).toBe('/search?q=c%2B%2B+%26+python')
    })
  })

  describe('isCanonicalSearchUrl', () => {
    it('validates canonical URL for page 1 omitting page param', () => {
      const params = new URLSearchParams('q=django')
      expect(isCanonicalSearchUrl(params, 'django', 1)).toBe(true)
    })

    it('returns false if page=1 is explicitly in searchParams', () => {
      const params = new URLSearchParams('q=django&page=1')
      expect(isCanonicalSearchUrl(params, 'django', 1)).toBe(false)
    })

    it('validates canonical URL for page 2', () => {
      const params = new URLSearchParams('q=django&page=2')
      expect(isCanonicalSearchUrl(params, 'django', 2)).toBe(true)
    })
  })

  describe('getVisibleSearchPages', () => {
    it('returns list of page numbers and ellipsis', () => {
      expect(getVisibleSearchPages(1, 5)).toEqual([1, 2, 'ellipsis-2', 5])
      expect(getVisibleSearchPages(3, 5)).toEqual([1, 2, 3, 4, 5])
    })
  })
})
