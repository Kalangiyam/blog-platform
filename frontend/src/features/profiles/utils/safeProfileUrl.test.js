import { describe, expect, it } from 'vitest'
import { getSafeProfileUrl, isSafeProfileUrl } from './safeProfileUrl.js'

describe('safeProfileUrl utility', () => {
  it('accepts valid HTTP and HTTPS absolute URLs', () => {
    expect(getSafeProfileUrl('https://example.com')).toBe('https://example.com/')
    expect(getSafeProfileUrl('http://mysite.org/about')).toBe('http://mysite.org/about')
    expect(isSafeProfileUrl('HTTPS://EXAMPLE.COM/PATH')).toBe(true)
  })

  it('rejects dangerous schemes', () => {
    expect(getSafeProfileUrl('javascript:alert(1)')).toBeNull()
    expect(getSafeProfileUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(getSafeProfileUrl('file:///C:/etc/passwd')).toBeNull()
    expect(isSafeProfileUrl('javascript:void(0)')).toBe(false)
  })

  it('rejects relative URLs, non-URLs, and malformed strings', () => {
    expect(getSafeProfileUrl('/relative/path')).toBeNull()
    expect(getSafeProfileUrl('example.com')).toBeNull()
    expect(getSafeProfileUrl('ht tp://invalid')).toBeNull()
    expect(getSafeProfileUrl('')).toBeNull()
    expect(getSafeProfileUrl(null)).toBeNull()
    expect(getSafeProfileUrl(undefined)).toBeNull()
  })
})
