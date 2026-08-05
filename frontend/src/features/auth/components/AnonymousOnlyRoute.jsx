import { Navigate, Outlet, useLocation } from 'react-router'

import { AUTH_STATUS } from '../context/AuthContext.js'
import { useAuth } from '../hooks/useAuth.js'
import { safeReturnPathFromState } from '../utils/safeReturnPath.js'
import AuthLoadingScreen from './AuthLoadingScreen.jsx'

export default function AnonymousOnlyRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === AUTH_STATUS.CHECKING) {
    return <AuthLoadingScreen />
  }

  if (status === AUTH_STATUS.AUTHENTICATED) {
    return (
      <Navigate replace to={safeReturnPathFromState(location.state)} />
    )
  }

  return <Outlet />
}
