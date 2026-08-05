const sessionInvalidationListeners = new Set()

export function subscribeToSessionInvalidation(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('Session invalidation listener must be a function.')
  }

  sessionInvalidationListeners.add(listener)

  return () => {
    sessionInvalidationListeners.delete(listener)
  }
}

export function notifySessionInvalidated(authError) {
  for (const listener of [...sessionInvalidationListeners]) {
    try {
      listener(authError)
    } catch {
      // A faulty subscriber must not prevent other subscribers from updating.
    }
  }
}
