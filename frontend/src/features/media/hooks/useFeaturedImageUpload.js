import { useCallback, useEffect, useRef, useState } from 'react'

import {
  removePostFeaturedImage,
  uploadPostFeaturedImage,
} from '../api/mediaApi.js'
import {
  validateFeaturedImageFile,
  validateImageDimensions,
} from '../utils/mediaValidation.js'
import { normalizeMediaError } from '../utils/normalizeMediaError.js'

/**
 * Custom hook for managing featured image upload, preview, progress, error, retry, abort, and removal.
 *
 * @param {object} params
 * @param {string} [params.initialImageUrl] - Current remote image URL of the post.
 * @param {string} [params.postSlug] - Slug of the post.
 * @param {function} [params.onUploadSuccess] - Callback when upload succeeds with new URL.
 * @param {function} [params.onRemoveSuccess] - Callback when removal succeeds.
 */
export function useFeaturedImageUpload({
  initialImageUrl = null,
  postSlug = null,
  onUploadSuccess,
  onRemoveSuccess,
} = {}) {
  const [status, setStatus] = useState('idle') // 'idle' | 'validating' | 'uploading' | 'success' | 'error' | 'removing'
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [localObjectUrl, setLocalObjectUrl] = useState(null)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [isRemoved, setIsRemoved] = useState(false)
  const [error, setError] = useState(null)

  const activeObjectUrlRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Object URL cleanup helper
  const revokeActiveObjectUrl = useCallback(() => {
    if (activeObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(activeObjectUrlRef.current)
      } catch {
        // ignore fallback
      }
      activeObjectUrlRef.current = null
    }
  }, [])

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      revokeActiveObjectUrl()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [revokeActiveObjectUrl])

  const clearSelection = useCallback(() => {
    revokeActiveObjectUrl()
    setSelectedFile(null)
    setLocalObjectUrl(null)
    setStatus('idle')
    setProgress(0)
    setError(null)
  }, [revokeActiveObjectUrl])

  const selectFile = useCallback(
    async (file) => {
      setError(null)

      if (!file) {
        clearSelection()
        return
      }

      const clientValidation = validateFeaturedImageFile(file)
      if (!clientValidation.isValid) {
        setError(normalizeMediaError(new Error(clientValidation.error)))
        setStatus('error')
        return
      }

      setStatus('validating')
      const dimensionValidation = await validateImageDimensions(file)
      if (!dimensionValidation.isValid) {
        setError(normalizeMediaError(new Error(dimensionValidation.error)))
        setStatus('error')
        return
      }

      revokeActiveObjectUrl()
      const objectUrl = URL.createObjectURL(file)
      activeObjectUrlRef.current = objectUrl

      setSelectedFile(file)
      setLocalObjectUrl(objectUrl)
      setIsRemoved(false)
      setStatus('idle')
      setProgress(0)
    },
    [clearSelection, revokeActiveObjectUrl],
  )

  const upload = useCallback(async () => {
    if (!selectedFile || !postSlug) {
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setStatus('uploading')
    setProgress(0)
    setError(null)

    try {
      const response = await uploadPostFeaturedImage(postSlug, selectedFile, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setProgress(percent)
          }
        },
        signal: controller.signal,
      })

      const newUrl = response.featured_image_url
      revokeActiveObjectUrl()
      setSelectedFile(null)
      setLocalObjectUrl(null)
      setUploadedUrl(newUrl)
      setIsRemoved(false)
      setProgress(100)
      setStatus('success')
      setError(null)

      if (onUploadSuccess) {
        onUploadSuccess(newUrl)
      }
    } catch (err) {
      const normalized = normalizeMediaError(err)
      if (normalized.code !== 'cancelled') {
        setStatus('error')
        setError(normalized)
      }
    } finally {
      abortControllerRef.current = null
    }
  }, [selectedFile, postSlug, revokeActiveObjectUrl, onUploadSuccess])

  const currentRemoteUrl = isRemoved
    ? null
    : uploadedUrl !== null
      ? uploadedUrl
      : initialImageUrl
  const previewUrl = localObjectUrl || currentRemoteUrl
  const isLocalPreview = Boolean(selectedFile && localObjectUrl)

  const remove = useCallback(async () => {
    // If only local file is selected and not uploaded yet
    if (selectedFile && !currentRemoteUrl) {
      clearSelection()
      if (onRemoveSuccess) {
        onRemoveSuccess()
      }
      return
    }

    if (!postSlug) {
      clearSelection()
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setStatus('removing')
    setError(null)

    try {
      await removePostFeaturedImage(postSlug, {
        signal: controller.signal,
      })

      revokeActiveObjectUrl()
      setSelectedFile(null)
      setLocalObjectUrl(null)
      setUploadedUrl(null)
      setIsRemoved(true)
      setProgress(0)
      setStatus('idle')
      setError(null)

      if (onRemoveSuccess) {
        onRemoveSuccess()
      }
    } catch (err) {
      const normalized = normalizeMediaError(err)
      if (normalized.code !== 'cancelled') {
        setStatus('error')
        setError(normalized)
      }
    } finally {
      abortControllerRef.current = null
    }
  }, [selectedFile, currentRemoteUrl, postSlug, clearSelection, revokeActiveObjectUrl, onRemoveSuccess])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setStatus('idle')
    setProgress(0)
  }, [])

  return {
    status,
    progress,
    selectedFile,
    previewUrl,
    currentUrl: currentRemoteUrl,
    isLocalPreview,
    error,
    isUploading: status === 'uploading',
    isRemoving: status === 'removing',
    isValidating: status === 'validating',
    selectFile,
    clearSelection,
    upload,
    remove,
    cancel,
    hasImage: Boolean(previewUrl),
  }
}
