import { describe, expect, it, vi } from 'vitest'

import {
  notifySessionInvalidated,
  subscribeToSessionInvalidation,
} from './sessionInvalidation.js'

describe('session invalidation bridge', () => {
  it('notifies active subscribers and supports cleanup', () => {
    const listener = vi.fn()
    const authError = { code: 'unauthorized' }
    const unsubscribe = subscribeToSessionInvalidation(listener)

    notifySessionInvalidated(authError)
    unsubscribe()
    notifySessionInvalidated(authError)

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(authError)
  })

  it('rejects invalid listeners', () => {
    expect(() => subscribeToSessionInvalidation(null)).toThrow(TypeError)
  })
})
