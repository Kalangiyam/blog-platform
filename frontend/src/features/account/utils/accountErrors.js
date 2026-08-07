export function normalizeAccountError(error) {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return { message: 'Request timed out. Please try again.', fieldErrors: {} }
    }
    return { message: 'Network error. Please check your connection.', fieldErrors: {} }
  }

  const { status, data } = error.response

  if (status === 429) {
    return { message: 'Too many requests. Please wait a while before trying again.', fieldErrors: {} }
  }

  if (status === 400 && data && typeof data === 'object') {
    const fieldErrors = {}
    let generalMessage = null

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        fieldErrors[key] = value.join(' ')
      } else if (typeof value === 'string') {
        fieldErrors[key] = value
      }
    }

    if (data.detail && typeof data.detail === 'string') {
      generalMessage = data.detail
    } else if (Object.keys(fieldErrors).length > 0) {
      generalMessage = 'Please correct the errors in the form.'
    }

    return {
      message: generalMessage || 'Invalid request.',
      fieldErrors,
    }
  }

  if (status === 401) {
    return { message: 'Authentication required. Please log in.', fieldErrors: {} }
  }

  if (status === 403) {
    return { message: 'You do not have permission to perform this action.', fieldErrors: {} }
  }

  return { message: 'An unexpected server error occurred.', fieldErrors: {} }
}
