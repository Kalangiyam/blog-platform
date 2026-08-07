import { createBrowserRouter } from 'react-router'

import AdminUserCreatePage from '../features/admin/pages/AdminUserCreatePage.jsx'
import AdminUserDetailPage from '../features/admin/pages/AdminUserDetailPage.jsx'
import AdminUsersPage from '../features/admin/pages/AdminUsersPage.jsx'
import AnonymousOnlyRoute from '../features/auth/components/AnonymousOnlyRoute.jsx'
import ProtectedRoute from '../features/auth/components/ProtectedRoute.jsx'
import RoleProtectedRoute from '../features/auth/components/RoleProtectedRoute.jsx'
import LoginPage from '../features/auth/pages/LoginPage.jsx'
import UnauthorizedPage from '../features/auth/pages/UnauthorizedPage.jsx'
import PostCreatePage from '../features/posts/pages/PostCreatePage.jsx'
import PostDetailPage from '../features/posts/pages/PostDetailPage.jsx'
import PostEditPage from '../features/posts/pages/PostEditPage.jsx'
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
            path: 'posts/new',
            element: (
              <RoleProtectedRoute requiredRoles={['Author', 'Editor']}>
                <PostCreatePage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: 'posts/:postSlug/edit',
            element: (
              <RoleProtectedRoute requiredRoles={['Author', 'Editor']}>
                <PostEditPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: 'profile',
            Component: MyProfilePage,
          },
          {
            path: 'unauthorized',
            Component: UnauthorizedPage,
          },
          {
            path: 'admin/users',
            element: (
              <RoleProtectedRoute requiredRoles={['Administrator']}>
                <AdminUsersPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: 'admin/users/new',
            element: (
              <RoleProtectedRoute requiredRoles={['Administrator']}>
                <AdminUserCreatePage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: 'admin/users/:userId',
            element: (
              <RoleProtectedRoute requiredRoles={['Administrator']}>
                <AdminUserDetailPage />
              </RoleProtectedRoute>
            ),
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
