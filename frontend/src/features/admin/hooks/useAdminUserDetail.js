import { useCallback, useEffect, useState } from 'react'

import {
  activateAdminUser,
  deactivateAdminUser,
  getAdminUserDetail,
  updateAdminUserRoles,
} from '../api/adminUsersApi.js'
import { ADMIN_USER_ERROR_CODES } from '../utils/normalizeAdminUserError.js'

/**
 * Custom hook for fetching single user detail and performing lifecycle mutations.
 *
 * @param {number|string} userId
 * @returns {{
 *   user: Object|null,
 *   isLoading: boolean,
 *   isPending: boolean,
 *   error: Object|null,
 *   mutationError: Object|null,
 *   roleSuccessMessage: string|null,
 *   activate: Function,
 *   deactivate: Function,
 *   updateRoles: Function,
 *   refetch: Function,
 *   clearMutationError: Function
 * }}
 */
export function useAdminUserDetail(userId) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)
  const [mutationError, setMutationError] = useState(null)
  const [roleSuccessMessage, setRoleSuccessMessage] = useState(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setReloadTrigger((prev) => prev + 1)
  }, [])

  const clearMutationError = useCallback(() => {
    setMutationError(null)
    setRoleSuccessMessage(null)
  }, [])

  useEffect(() => {
    if (!userId) {
      return
    }

    const controller = new AbortController()
    let active = true

    getAdminUserDetail(userId, { signal: controller.signal })
      .then((res) => {
        if (active) {
          setUser(res)
          setError(null)
          setMutationError(null)
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
  }, [userId, reloadTrigger])

  const activate = useCallback(async () => {
    if (!userId || isPending) return
    setIsPending(true)
    setMutationError(null)
    setRoleSuccessMessage(null)

    try {
      const updatedUser = await activateAdminUser(userId)
      setUser(updatedUser)
    } catch (err) {
      setMutationError(err)
    } finally {
      setIsPending(false)
    }
  }, [userId, isPending])

  const deactivate = useCallback(async () => {
    if (!userId || isPending) return
    setIsPending(true)
    setMutationError(null)
    setRoleSuccessMessage(null)

    try {
      const updatedUser = await deactivateAdminUser(userId)
      setUser(updatedUser)
    } catch (err) {
      setMutationError(err)
    } finally {
      setIsPending(false)
    }
  }, [userId, isPending])

  const updateRoles = useCallback(async (newRoles) => {
    if (!userId || isPending) return
    setIsPending(true)
    setMutationError(null)
    setRoleSuccessMessage(null)

    try {
      const updatedUser = await updateAdminUserRoles(userId, newRoles)
      setUser(updatedUser)
      setRoleSuccessMessage('Application roles replaced successfully.')
    } catch (err) {
      setMutationError(err)
    } finally {
      setIsPending(false)
    }
  }, [userId, isPending])

  return {
    user,
    isLoading,
    isPending,
    error,
    mutationError,
    roleSuccessMessage,
    activate,
    deactivate,
    updateRoles,
    refetch,
    clearMutationError,
  }
}
