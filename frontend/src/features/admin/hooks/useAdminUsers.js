import { useCallback, useEffect, useState } from 'react'

import { getAdminUsers } from '../api/adminUsersApi.js'
import { ADMIN_USER_ERROR_CODES } from '../utils/normalizeAdminUserError.js'

/**
 * Custom hook for fetching and managing paginated Administrator user lists.
 *
 * @param {number} [page=1]
 * @returns {{
 *   users: Array,
 *   count: number,
 *   next: string|null,
 *   previous: string|null,
 *   isLoading: boolean,
 *   error: Object|null,
 *   refetch: Function
 * }}
 */
export function useAdminUsers(page = 1) {
  const [data, setData] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setReloadTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    getAdminUsers(page, { signal: controller.signal })
      .then((res) => {
        if (active) {
          setData(res)
          setError(null)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (active && err?.code !== ADMIN_USER_ERROR_CODES.CANCELLED) {
          setError(err)
          setIsLoading(false)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [page, reloadTrigger])

  return {
    users: data.results,
    count: data.count,
    next: data.next,
    previous: data.previous,
    isLoading,
    error,
    refetch,
  }
}
