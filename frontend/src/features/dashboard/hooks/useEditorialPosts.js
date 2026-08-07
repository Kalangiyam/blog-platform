import { useCallback, useEffect, useRef, useState } from 'react'
import { getEditorialPosts, restoreEditorialPost } from '../api/dashboardApi.js'
import { deletePost, publishPost, unpublishPost } from '../../posts/api/postsApi.js'

export function useEditorialPosts() {
  const [postsData, setPostsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [isDeletedFilter, setIsDeletedFilter] = useState(false)
  const [pendingActionSlug, setPendingActionSlug] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const isMountedRef = useRef(true)

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    setReloadTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    getEditorialPosts({
      page,
      status: statusFilter || undefined,
      is_deleted: isDeletedFilter ? true : undefined,
      signal: controller.signal,
    })
      .then((data) => {
        if (active) {
          setPostsData(data)
          setError(null)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (active && err?.name !== 'CanceledError' && err?.name !== 'AbortError') {
          setError(err)
          setIsLoading(false)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [page, statusFilter, isDeletedFilter, reloadTrigger])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])



  const handlePublish = async (slug) => {
    setPendingActionSlug(slug)
    try {
      await publishPost(slug)
      await fetchPosts()
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      if (isMountedRef.current) {
        setPendingActionSlug(null)
      }
    }
  }

  const handleUnpublish = async (slug) => {
    setPendingActionSlug(slug)
    try {
      await unpublishPost(slug)
      await fetchPosts()
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      if (isMountedRef.current) {
        setPendingActionSlug(null)
      }
    }
  }

  const handleDelete = async (slug) => {
    setPendingActionSlug(slug)
    try {
      await deletePost(slug)
      await fetchPosts()
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      if (isMountedRef.current) {
        setPendingActionSlug(null)
      }
    }
  }

  const handleRestore = async (slug) => {
    setPendingActionSlug(slug)
    try {
      await restoreEditorialPost(slug)
      await fetchPosts()
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      if (isMountedRef.current) {
        setPendingActionSlug(null)
      }
    }
  }

  return {
    postsData,
    isLoading,
    error,
    page,
    statusFilter,
    isDeletedFilter,
    pendingActionSlug,
    setPage,
    setStatusFilter: (val) => {
      setPage(1)
      setStatusFilter(val)
    },
    setIsDeletedFilter: (val) => {
      setPage(1)
      setIsDeletedFilter(val)
    },
    handlePublish,
    handleUnpublish,
    handleDelete,
    handleRestore,
    retry: fetchPosts,
  }
}
