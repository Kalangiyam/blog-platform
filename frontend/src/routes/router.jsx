import { createBrowserRouter } from 'react-router'

import AnonymousOnlyRoute from '../features/auth/components/AnonymousOnlyRoute.jsx'
import ProtectedRoute from '../features/auth/components/ProtectedRoute.jsx'
import LoginPage from '../features/auth/pages/LoginPage.jsx'
import UnauthorizedPage from '../features/auth/pages/UnauthorizedPage.jsx'
import PostDetailPage from '../features/posts/pages/PostDetailPage.jsx'
import PostListPage from '../features/posts/pages/PostListPage.jsx'
import MyProfilePage from '../features/profiles/pages/MyProfilePage.jsx'
import PublicProfilePage from '../features/profiles/pages/PublicProfilePage.jsx'
import SearchResultsPage from '../features/search/pages/SearchResultsPage.jsx'
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
        path: 'search',
        Component: SearchResultsPage,
      },
      {
        path: 'posts',
        Component: PostListPage,
      },
      {
        path: 'posts/:postSlug',
        Component: PostDetailPage,
      },
      {
        path: 'users/:username',
        Component: PublicProfilePage,
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
            path: 'profile',
            Component: MyProfilePage,
          },
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

