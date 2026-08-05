import { Navigate, Outlet, useLocation } from 'react-router'

import { AUTH_STATUS } from '../context/AuthContext.js'
import { useAuth } from '../hooks/useAuth.js'
import AuthLoadingScreen from './AuthLoadingScreen.jsx'

function getReturnLocation(location) {
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  }
}

export default function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === AUTH_STATUS.CHECKING) {
    return <AuthLoadingScreen />
  }

  if (status !== AUTH_STATUS.AUTHENTICATED) {
    return (
      <Navigate
        replace
        state={{ from: getReturnLocation(location) }}
        to="/login"
      />
    )
  }

  return <Outlet />
}
