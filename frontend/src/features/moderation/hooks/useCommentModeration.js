import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteCommentModeration,
  getCommentModerationList,
  restoreCommentModeration,
} from '../api/moderationApi.js'

export function useCommentModeration() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [isDeletedFilter, setIsDeletedFilter] = useState(false)
  const [pendingActionId, setPendingActionId] = useState(null)

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const [reloadTrigger, setReloadTrigger] = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setReloadTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    getCommentModerationList({
      page,
      is_deleted: isDeletedFilter ? true : undefined,
      signal: controller.signal,
    })
      .then((result) => {
        if (active) {
          setData(result)
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
  }, [page, isDeletedFilter, reloadTrigger])

  const handleDelete = async (id) => {
    setPendingActionId(id)
    setError(null)

    try {
      await deleteCommentModeration(id)
      await fetchData()
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      if (isMountedRef.current) {
        setPendingActionId(null)
      }
    }
  }

  const handleRestore = async (id) => {
    setPendingActionId(id)
    setError(null)

    try {
      await restoreCommentModeration(id)
      await fetchData()
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      if (isMountedRef.current) {
        setPendingActionId(null)
      }
    }
  }

  return {
    data,
    isLoading,
    error,
    page,
    isDeletedFilter,
    pendingActionId,
    setPage,
    setIsDeletedFilter: (val) => {
      setPage(1)
      setIsDeletedFilter(val)
    },
    handleDelete,
    handleRestore,
    retry: fetchData,
  }
}
