import { createContext } from 'react'

export const AUTH_STATUS = Object.freeze({
  CHECKING: 'checking',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
})

export const AuthContext = createContext(null)
