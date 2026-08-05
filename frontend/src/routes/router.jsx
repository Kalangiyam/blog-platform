import { createBrowserRouter } from 'react-router'

import AnonymousOnlyRoute from '../features/auth/components/AnonymousOnlyRoute.jsx'
import ProtectedRoute from '../features/auth/components/ProtectedRoute.jsx'
import LoginPage from '../features/auth/pages/LoginPage.jsx'
import UnauthorizedPage from '../features/auth/pages/UnauthorizedPage.jsx'
import RootLayout from '../layouts/RootLayout.jsx'
import HomePage from '../pages/HomePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import RouteErrorPage from '../pages/RouteErrorPage.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        Component: AnonymousOnlyRoute,
        children: [
          {
            path: 'login',
            Component: LoginPage,
          },
        ],
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: 'unauthorized',
            Component: UnauthorizedPage,
          },
        ],
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
])
