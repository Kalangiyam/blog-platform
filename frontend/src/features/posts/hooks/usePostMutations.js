import { useCallback, useState } from 'react'
import {
  createPost,
  deletePost,
  publishPost,
  removeFeaturedImage,
  unpublishPost,
  updatePost,
  uploadFeaturedImage,
} from '../api/postsApi.js'

export function usePostMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleCreatePost = useCallback(async (postData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await createPost(postData)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleUpdatePost = useCallback(async (slug, postData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await updatePost(slug, postData)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleDeletePost = useCallback(async (slug) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await deletePost(slug)
      return true
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handlePublishPost = useCallback(async (slug) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await publishPost(slug)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleUnpublishPost = useCallback(async (slug) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await unpublishPost(slug)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleUploadFeaturedImage = useCallback(async (slug, imageFile) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await uploadFeaturedImage(slug, imageFile)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const handleRemoveFeaturedImage = useCallback(async (slug) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await removeFeaturedImage(slug)
      return true
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return {
    isSubmitting,
    error,
    clearError,
    handleCreatePost,
    handleUpdatePost,
    handleDeletePost,
    handlePublishPost,
    handleUnpublishPost,
    handleUploadFeaturedImage,
    handleRemoveFeaturedImage,
  }
}
