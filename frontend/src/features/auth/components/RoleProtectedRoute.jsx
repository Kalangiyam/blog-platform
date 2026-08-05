import { Navigate, useLocation } from 'react-router'

import { AUTH_STATUS } from '../context/AuthContext.js'
import { useAuth } from '../hooks/useAuth.js'
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx'
import AuthLoadingScreen from './AuthLoadingScreen.jsx'

function isValidRoleConfiguration(requiredRoles) {
  return (
    Array.isArray(requiredRoles) &&
    requiredRoles.length > 0 &&
    requiredRoles.every(
      (role) => typeof role === 'string' && role.trim().length > 0,
    )
  )
}

export default function RoleProtectedRoute({ children, requiredRoles }) {
  const { status, hasAnyRole } = useAuth()
  const location = useLocation()

  if (status === AUTH_STATUS.CHECKING) {
    return <AuthLoadingScreen />
  }

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return (
      <Navigate
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
        to="/login"
      />
    )
  }

  if (
    !isValidRoleConfiguration(requiredRoles) ||
    !hasAnyRole(requiredRoles)
  ) {
    return <UnauthorizedPage />
  }

  return children
}
