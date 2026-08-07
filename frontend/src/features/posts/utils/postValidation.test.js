import { describe, expect, it } from 'vitest'
import { validatePostForm } from './postValidation.js'

describe('validatePostForm', () => {
  it('validates a correct post form payload', () => {
    const result = validatePostForm({
      title: 'A Valid Title',
      excerpt: 'Short excerpt',
      content: 'Full body content here...',
      category_slugs: ['tech'],
      tag_slugs: ['react'],
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('rejects missing or empty title and content', () => {
    const result = validatePostForm({
      title: '   ',
      content: '',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.title).toContain('Title is required.')
    expect(result.errors.content).toContain('Content is required.')
  })

  it('rejects oversized title and excerpt', () => {
    const result = validatePostForm({
      title: 'A'.repeat(256),
      excerpt: 'B'.repeat(501),
      content: 'Valid content',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.title).toContain('Title cannot exceed 255 characters.')
    expect(result.errors.excerpt).toContain('Excerpt cannot exceed 500 characters.')
  })

  it('rejects non-array taxonomy slug structures', () => {
    const result = validatePostForm({
      title: 'Title',
      content: 'Content',
      category_slugs: 'not-an-array',
      tag_slugs: 123,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.category_slugs).toContain('Categories must be an array of slugs.')
    expect(result.errors.tag_slugs).toContain('Tags must be an array of slugs.')
  })
})
