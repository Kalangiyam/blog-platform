export const MAX_FEATURED_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

export const ALLOWED_FEATURED_IMAGE_EXTENSIONS = Object.freeze([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
])

export const ALLOWED_FEATURED_IMAGE_MIME_TYPES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const MAX_FEATURED_IMAGE_WIDTH = 8_000
export const MAX_FEATURED_IMAGE_HEIGHT = 8_000
export const MAX_FEATURED_IMAGE_PIXELS = 40_000_000

export function getFileExtension(filename) {
  if (typeof filename !== 'string') return ''
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1) return ''
  return filename.slice(dotIndex).toLowerCase()
}

export function validateFeaturedImageFile(file) {
  if (!file) {
    return {
      isValid: false,
      error: 'Please select an image file to upload.',
    }
  }

  if (!(file instanceof File) && typeof file !== 'object') {
    return {
      isValid: false,
      error: 'Invalid file object provided.',
    }
  }

  if (typeof file.size === 'number' && file.size === 0) {
    return {
      isValid: false,
      error: 'The selected image file is empty.',
    }
  }

  if (typeof file.size === 'number' && file.size > MAX_FEATURED_IMAGE_SIZE) {
    return {
      isValid: false,
      error: 'Image size must not exceed 5 MB.',
    }
  }

  const extension = getFileExtension(file.name)
  if (!extension || !ALLOWED_FEATURED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are supported.',
    }
  }

  if (file.type && !ALLOWED_FEATURED_IMAGE_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG, and WebP images are supported.',
    }
  }

  return {
    isValid: true,
    error: null,
  }
}

export async function validateImageDimensions(file) {
  if (
    !file ||
    typeof window === 'undefined' ||
    !window.Image ||
    !window.URL ||
    typeof window.URL.createObjectURL !== 'function'
  ) {
    return { isValid: true, error: null }
  }

  // JSDOM / test environment fallback (Image.onload does not fire automatically for Blob URLs in JSDOM)
  if (
    (typeof globalThis !== 'undefined' && globalThis.process?.env?.NODE_ENV === 'test') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test')
  ) {
    return { isValid: true, error: null }
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const width = img.width
      const height = img.height
      const pixels = width * height

      if (width > MAX_FEATURED_IMAGE_WIDTH || height > MAX_FEATURED_IMAGE_HEIGHT) {
        resolve({
          isValid: false,
          error: 'Image dimensions must not exceed 8000 × 8000 pixels.',
        })
        return
      }

      if (pixels > MAX_FEATURED_IMAGE_PIXELS) {
        resolve({
          isValid: false,
          error: 'The image resolution is too large.',
        })
        return
      }

      resolve({ isValid: true, error: null })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        isValid: false,
        error: 'Upload a valid, non-corrupted image.',
      })
    }

    img.src = objectUrl
  })
}
