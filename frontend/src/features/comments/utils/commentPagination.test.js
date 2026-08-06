import { describe, expect, it } from 'vitest'

import {
  buildCommentsSearch,
  isCanonicalCommentsSearch,
  parseCommentsPage,
} from './commentPagination.js'

describe('commentPagination', () => {
  describe('parseCommentsPage', () => {
    it('defaults to page 1 when commentsPage is missing', () => {
      const params = new URLSearchParams('')
      expect(parseCommentsPage(params)).toBe(1)
    })

    it('parses valid positive integer', () => {
      const params = new URLSearchParams('commentsPage=3')
      expect(parseCommentsPage(params)).toBe(3)
    })

    it('normalizes 0, negative numbers, decimals, non-numeric, whitespace', () => {
      expect(parseCommentsPage(new URLSearchParams('commentsPage=0'))).toBe(1)
      expect(parseCommentsPage(new URLSearchParams('commentsPage=-2'))).toBe(1)
      expect(parseCommentsPage(new URLSearchParams('commentsPage=2.5'))).toBe(1)
      expect(parseCommentsPage(new URLSearchParams('commentsPage=abc'))).toBe(1)
      expect(parseCommentsPage(new URLSearchParams('commentsPage=   '))).toBe(1)
    })

    it('normalizes repeated parameters', () => {
      expect(
        parseCommentsPage(new URLSearchParams('commentsPage=2&commentsPage=3')),
      ).toBe(1)
    })

    it('normalizes very large unsafe numbers', () => {
      expect(
        parseCommentsPage(
          new URLSearchParams('commentsPage=99999999999999999999999'),
        ),
      ).toBe(1)
    })
  })

  describe('buildCommentsSearch', () => {
    it('omits commentsPage when page is 1 (canonicalization)', () => {
      const params = new URLSearchParams('commentsPage=2&foo=bar')
      expect(buildCommentsSearch(params, 1)).toBe('?foo=bar')
    })

    it('sets commentsPage parameter for page > 1 preserving other params', () => {
      const params = new URLSearchParams('foo=bar')
      expect(buildCommentsSearch(params, 3)).toBe('?foo=bar&commentsPage=3')
    })

    it('returns empty string if no params remain on page 1', () => {
      const params = new URLSearchParams('commentsPage=2')
      expect(buildCommentsSearch(params, 1)).toBe('')
    })
  })

  describe('isCanonicalCommentsSearch', () => {
    it('returns true when commentsPage is absent', () => {
      expect(isCanonicalCommentsSearch(new URLSearchParams(''))).toBe(true)
    })

    it('returns false when commentsPage=1 is explicitly present', () => {
      expect(
        isCanonicalCommentsSearch(new URLSearchParams('commentsPage=1')),
      ).toBe(false)
    })

    it('returns false when commentsPage is invalid e.g. commentsPage=abc', () => {
      expect(
        isCanonicalCommentsSearch(new URLSearchParams('commentsPage=abc')),
      ).toBe(false)
    })

    it('returns true for canonical page > 1', () => {
      expect(
        isCanonicalCommentsSearch(new URLSearchParams('commentsPage=2')),
      ).toBe(true)
    })
  })
})
