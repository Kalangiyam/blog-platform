import { describe, expect, it } from 'vitest'

import {
  getFileExtension,
  MAX_FEATURED_IMAGE_SIZE,
  validateFeaturedImageFile,
} from './mediaValidation.js'

describe('mediaValidation', () => {
  describe('getFileExtension', () => {
    it('extracts lowercased extensions correctly', () => {
      expect(getFileExtension('photo.JPG')).toBe('.jpg')
      expect(getFileExtension('image.PNG')).toBe('.png')
      expect(getFileExtension('graphic.WebP')).toBe('.webp')
      expect(getFileExtension('file.with.multiple.dots.jpeg')).toBe('.jpeg')
    })

    it('returns empty string for missing extension or non-string', () => {
      expect(getFileExtension('filename')).toBe('')
      expect(getFileExtension(null)).toBe('')
      expect(getFileExtension(123)).toBe('')
    })
  })

  describe('validateFeaturedImageFile', () => {
    it('rejects null or missing file', () => {
      const result = validateFeaturedImageFile(null)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Please select an image file to upload.')
    })

    it('rejects 0-byte empty file', () => {
      const file = new File([''], 'empty.jpg', { type: 'image/jpeg' })
      const result = validateFeaturedImageFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('The selected image file is empty.')
    })

    it('rejects file larger than 5 MB', () => {
      const oversizedContent = new ArrayBuffer(MAX_FEATURED_IMAGE_SIZE + 1)
      const file = new File([oversizedContent], 'large.jpg', { type: 'image/jpeg' })
      const result = validateFeaturedImageFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Image size must not exceed 5 MB.')
    })

    it('rejects unsupported extensions', () => {
      const file = new File(['data'], 'document.pdf', { type: 'application/pdf' })
      const result = validateFeaturedImageFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Only JPEG, PNG, and WebP images are supported.')
    })

    it('rejects unsupported MIME types', () => {
      const file = new File(['data'], 'image.jpg', { type: 'image/gif' })
      const result = validateFeaturedImageFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Only JPEG, PNG, and WebP images are supported.')
    })

    it('accepts valid JPEG, PNG, and WebP files under 5 MB', () => {
      const validJpg = new File(['image-content'], 'hero.jpg', { type: 'image/jpeg' })
      const validPng = new File(['image-content'], 'banner.png', { type: 'image/png' })
      const validWebp = new File(['image-content'], 'thumb.webp', { type: 'image/webp' })

      expect(validateFeaturedImageFile(validJpg)).toEqual({ isValid: true, error: null })
      expect(validateFeaturedImageFile(validPng)).toEqual({ isValid: true, error: null })
      expect(validateFeaturedImageFile(validWebp)).toEqual({ isValid: true, error: null })
    })
  })
})
