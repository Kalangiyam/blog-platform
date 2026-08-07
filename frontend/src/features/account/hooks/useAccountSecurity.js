import { useRef, useState } from 'react'
import {
  changePassword,
  confirmEmailVerification,
  confirmPasswordReset,
  requestPasswordReset,
  sendEmailVerification,
} from '../api/accountSecurityApi.js'
import { useAuth } from '../../auth/hooks/useAuth.js'

export function useAccountSecurity() {
  const { logout } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const isMountedRef = useRef(true)

  const handleChangePassword = async (formData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await changePassword(formData)
      if (isMountedRef.current) {
        setSuccessMessage(res.detail || 'Password changed successfully.')
      }
      // Locally invalidate frontend authentication session & force relogin
      await logout()
      return res
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

  const handleRequestPasswordReset = async (formData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await requestPasswordReset(formData)
      if (isMountedRef.current) {
        setSuccessMessage(res.detail)
      }
      return res
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

  const handleConfirmPasswordReset = async (formData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await confirmPasswordReset(formData)
      if (isMountedRef.current) {
        setSuccessMessage(res.detail)
      }
      return res
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

  const handleResendEmailVerification = async () => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await sendEmailVerification()
      if (isMountedRef.current) {
        setSuccessMessage(res.detail)
      }
      return res
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

  const handleConfirmEmailVerification = async (payload) => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await confirmEmailVerification(payload)
      if (isMountedRef.current) {
        setSuccessMessage(res.detail)
      }
      return res
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

  return {
    isSubmitting,
    error,
    successMessage,
    handleChangePassword,
    handleRequestPasswordReset,
    handleConfirmPasswordReset,
    handleResendEmailVerification,
    handleConfirmEmailVerification,
    clearError: () => setError(null),
    clearSuccess: () => setSuccessMessage(null),
  }
}
