import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createManagementCategory,
  createManagementTag,
  getManagementCategories,
  getManagementTags,
  updateManagementCategory,
  updateManagementTag,
} from '../api/taxonomiesApi.js'

export function useTaxonomyManagement(type = 'category') {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

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

    const req = type === 'category'
      ? getManagementCategories({ page, signal: controller.signal })
      : getManagementTags({ page, signal: controller.signal })

    req
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
  }, [type, page, reloadTrigger])

  const handleSave = async (formData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingItem) {
        if (type === 'category') {
          await updateManagementCategory(editingItem.slug, formData)
        } else {
          await updateManagementTag(editingItem.slug, formData)
        }
      } else {
        if (type === 'category') {
          await createManagementCategory(formData)
        } else {
          await createManagementTag(formData)
        }
      }

      if (isMountedRef.current) {
        setEditingItem(null)
      }
      await fetchData()
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
      }
      throw err
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  const handleToggleActive = async (item) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const updated = { name: item.name, is_active: !item.is_active }
      if (type === 'category') {
        await updateManagementCategory(item.slug, updated)
      } else {
        await updateManagementTag(item.slug, updated)
      }
      await fetchData()
    } catch (err) {
      if (isMountedRef.current) {
        setError(err)
      }
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  return {
    data,
    isLoading,
    error,
    page,
    isSubmitting,
    editingItem,
    setPage,
    setEditingItem,
    handleSave,
    handleToggleActive,
    retry: fetchData,
  }
}
