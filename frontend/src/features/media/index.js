export { default as FeaturedImagePreview } from './components/FeaturedImagePreview.jsx'
export { default as FeaturedImageUploader } from './components/FeaturedImageUploader.jsx'
export { default as ImageDropZone } from './components/ImageDropZone.jsx'
export { default as RemoveImageButton } from './components/RemoveImageButton.jsx'
export { default as UploadError } from './components/UploadError.jsx'
export { default as UploadProgress } from './components/UploadProgress.jsx'

export { useFeaturedImageUpload } from './hooks/useFeaturedImageUpload.js'

export {
  removePostFeaturedImage,
  uploadPostFeaturedImage,
} from './api/mediaApi.js'

export {
  ALLOWED_FEATURED_IMAGE_EXTENSIONS,
  ALLOWED_FEATURED_IMAGE_MIME_TYPES,
  MAX_FEATURED_IMAGE_SIZE,
  validateFeaturedImageFile,
  validateImageDimensions,
} from './utils/mediaValidation.js'

export {
  MEDIA_ERROR_CODES,
  normalizeMediaError,
} from './utils/normalizeMediaError.js'
