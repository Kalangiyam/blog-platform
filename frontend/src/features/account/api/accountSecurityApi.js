import { apiClient } from '../../../lib/apiClient.js'
import { normalizeAccountError } from '../utils/accountErrors.js'

export async function changePassword(payload, { signal } = {}) {
  try {
    const response = await apiClient.post('/auth/password/change/', payload, { signal })
    return response.data
  } catch (error) {
    throw normalizeAccountError(error)
  }
}

export async function requestPasswordReset(payload, { signal } = {}) {
  try {
    const response = await apiClient.post('/auth/password/reset/', payload, { signal })
    return response.data
  } catch (error) {
    throw normalizeAccountError(error)
  }
}

export async function confirmPasswordReset(payload, { signal } = {}) {
  try {
    const response = await apiClient.post('/auth/password/reset/confirm/', payload, { signal })
    return response.data
  } catch (error) {
    throw normalizeAccountError(error)
  }
}

export async function sendEmailVerification({ signal } = {}) {
  try {
    const response = await apiClient.post('/auth/email/verify/send/', {}, { signal })
    return response.data
  } catch (error) {
    throw normalizeAccountError(error)
  }
}

export async function confirmEmailVerification(payload, { signal } = {}) {
  try {
    const response = await apiClient.post('/auth/email/verify/confirm/', payload, { signal })
    return response.data
  } catch (error) {
    throw normalizeAccountError(error)
  }
}
