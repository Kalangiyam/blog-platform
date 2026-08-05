import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from '../api/authApi.js'
import { subscribeToSessionInvalidation } from '../events/sessionInvalidation.js'
import {
  clearAccessToken,
  clearAuthTokens,
  getRefreshToken,
} from '../storage/tokenStorage.js'
import {
  AUTH_ERROR_CODES,
  normalizeAuthError,
} from '../utils/authErrors.js'
import { AuthContext, AUTH_STATUS } from './AuthContext.js'
import { restoreSession } from './sessionRestoration.js'

const AUTH_ACTIONS = Object.freeze({
  RESTORED: 'restored',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  CLEAR_ERROR: 'clear-error',
})

const INITIAL_AUTH_STATE = Object.freeze({
  user: null,
  status: AUTH_STATUS.CHECKING,
  authError: null,
})

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.RESTORED:
      return action.payload
    case AUTH_ACTIONS.AUTHENTICATED:
      return {
        user: action.user,
        status: AUTH_STATUS.AUTHENTICATED,
        authError: null,
      }
    case AUTH_ACTIONS.UNAUTHENTICATED:
      return {
        user: null,
        status: AUTH_STATUS.UNAUTHENTICATED,
        authError: action.authError ?? null,
      }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return state.authError === null
        ? state
        : {
            ...state,
            authError: null,
          }
    default:
      return state
  }
}

function isValidRole(role) {
  return typeof role === 'string' && role.trim().length > 0
}

function getValidUserRoles(user) {
  const roles = user?.roles

  if (!Array.isArray(roles) || !roles.every(isValidRole)) {
    return null
  }

  return roles
}

function userHasRole(user, role) {
  const roles = getValidUserRoles(user)

  return roles !== null && isValidRole(role) && roles.includes(role)
}

function userHasAnyRole(user, requiredRoles) {
  const roles = getValidUserRoles(user)

  if (
    roles === null ||
    !Array.isArray(requiredRoles) ||
    requiredRoles.length === 0 ||
    !requiredRoles.every(isValidRole)
  ) {
    return false
  }

  return requiredRoles.some((role) => roles.includes(role))
}

function isDefinitiveSessionError(authError) {
  return (
    authError.code === AUTH_ERROR_CODES.UNAUTHORIZED ||
    authError.code === AUTH_ERROR_CODES.STORAGE_UNAVAILABLE
  )
}

async function waitForRestoration(restorationPromiseRef) {
  const restorationPromise = restorationPromiseRef.current

  if (!restorationPromise) {
    return
  }

  try {
    await restorationPromise
  } catch {
    // The provider handles restoration errors before a new auth action starts.
  }
}

export default function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE)
  const mountedRef = useRef(false)
  const restorationPromiseRef = useRef(null)
  const logoutPromiseRef = useRef(null)

  useEffect(() => {
    let isActive = true
    mountedRef.current = true

    const restorationPromise = restoreSession()
    restorationPromiseRef.current = restorationPromise

    restorationPromise.then(
      (result) => {
        if (restorationPromiseRef.current === restorationPromise) {
          restorationPromiseRef.current = null
        }

        if (isActive) {
          dispatch({
            type: AUTH_ACTIONS.RESTORED,
            payload: result,
          })
        }
      },
      (error) => {
        const authError = normalizeAuthError(error, 'session-restoration')

        clearAccessToken()

        if (isDefinitiveSessionError(authError)) {
          clearAuthTokens()
        }

        if (restorationPromiseRef.current === restorationPromise) {
          restorationPromiseRef.current = null
        }

        if (isActive) {
          dispatch({
            type: AUTH_ACTIONS.UNAUTHENTICATED,
            authError,
          })
        }
      },
    )

    return () => {
      isActive = false
      mountedRef.current = false
    }
  }, [])

  useEffect(
    () =>
      subscribeToSessionInvalidation((error) => {
        const authError = normalizeAuthError(error, 'session-invalidation')

        if (mountedRef.current) {
          dispatch({
            type: AUTH_ACTIONS.UNAUTHENTICATED,
            authError,
          })
        }
      }),
    [],
  )

  const clearAuthError = useCallback(() => {
    if (mountedRef.current) {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
    }
  }, [])

  const login = useCallback(async (credentials) => {
    await waitForRestoration(restorationPromiseRef)

    if (mountedRef.current) {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
    }

    try {
      await loginRequest(credentials)
      const user = await getCurrentUser()

      if (mountedRef.current) {
        dispatch({
          type: AUTH_ACTIONS.AUTHENTICATED,
          user,
        })
      }

      return user
    } catch (error) {
      const authError = normalizeAuthError(error, 'login')

      clearAuthTokens()

      if (mountedRef.current) {
        dispatch({
          type: AUTH_ACTIONS.UNAUTHENTICATED,
          authError,
        })
      }

      throw authError
    }
  }, [])

  const logout = useCallback(() => {
    if (logoutPromiseRef.current) {
      return logoutPromiseRef.current
    }

    const logoutOperation = (async () => {
      await waitForRestoration(restorationPromiseRef)

      if (mountedRef.current) {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
      }

      if (!getRefreshToken()) {
        clearAuthTokens()

        if (mountedRef.current) {
          dispatch({ type: AUTH_ACTIONS.UNAUTHENTICATED })
        }

        return undefined
      }

      if (mountedRef.current) {
        dispatch({ type: AUTH_ACTIONS.UNAUTHENTICATED })
      }

      let authError = null

      try {
        return await logoutRequest()
      } catch (error) {
        authError = normalizeAuthError(error, 'logout')
        throw authError
      } finally {
        clearAuthTokens()

        if (mountedRef.current) {
          dispatch({
            type: AUTH_ACTIONS.UNAUTHENTICATED,
            authError,
          })
        }
      }
    })()

    const guardedLogoutOperation = logoutOperation.finally(() => {
      if (logoutPromiseRef.current === guardedLogoutOperation) {
        logoutPromiseRef.current = null
      }
    })

    logoutPromiseRef.current = guardedLogoutOperation

    return guardedLogoutOperation
  }, [])

  const hasRole = useCallback(
    (role) => userHasRole(state.user, role),
    [state.user],
  )

  const hasAnyRole = useCallback(
    (roles) => userHasAnyRole(state.user, roles),
    [state.user],
  )

  const contextValue = useMemo(
    () => ({
      user: state.user,
      status: state.status,
      isAuthenticated: state.status === AUTH_STATUS.AUTHENTICATED,
      authError: state.authError,
      login,
      logout,
      clearAuthError,
      hasRole,
      hasAnyRole,
    }),
    [
      state.user,
      state.status,
      state.authError,
      login,
      logout,
      clearAuthError,
      hasRole,
      hasAnyRole,
    ],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
