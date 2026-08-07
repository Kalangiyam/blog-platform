import { Navigate, createBrowserRouter } from 'react-router'

import CategoryManagementPage from '../features/taxonomies/pages/CategoryManagementPage.jsx'
import CommentModerationPage from '../features/moderation/pages/CommentModerationPage.jsx'
import DashboardLayout from '../features/dashboard/layouts/DashboardLayout.jsx'
import EditorialPostsPage from '../features/dashboard/pages/EditorialPostsPage.jsx'
import EmailVerificationPage from '../features/account/pages/EmailVerificationPage.jsx'
import EmailVerifyConfirmPage from '../features/account/pages/EmailVerifyConfirmPage.jsx'
import ForgotPasswordPage from '../features/account/pages/ForgotPasswordPage.jsx'
import PasswordChangePage from '../features/account/pages/PasswordChangePage.jsx'
import PasswordResetPage from '../features/account/pages/PasswordResetPage.jsx'
import TagManagementPage from '../features/taxonomies/pages/TagManagementPage.jsx'

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
        path: 'verify-email/:uid/:token',
        Component: EmailVerifyConfirmPage,
      },
      {
        Component: AnonymousOnlyRoute,
        children: [
          {
            path: 'login',
            Component: LoginPage,
          },
          {
            path: 'forgot-password',
            Component: ForgotPasswordPage,
          },
          {
            path: 'reset-password/:uid/:token',
            Component: PasswordResetPage,
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
            path: 'dashboard',
            element: (
              <RoleProtectedRoute requiredRoles={['Author', 'Editor']}>
                <DashboardLayout />
              </RoleProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: <Navigate replace to="/dashboard/posts" />,
              },
              {
                path: 'posts',
                Component: EditorialPostsPage,
              },
              {
                path: 'categories',
                element: (
                  <RoleProtectedRoute requiredRoles={['Editor']}>
                    <CategoryManagementPage />
                  </RoleProtectedRoute>
                ),
              },
              {
                path: 'tags',
                element: (
                  <RoleProtectedRoute requiredRoles={['Editor']}>
                    <TagManagementPage />
                  </RoleProtectedRoute>
                ),
              },
              {
                path: 'comments',
                element: (
                  <RoleProtectedRoute requiredRoles={['Editor']}>
                    <CommentModerationPage />
                  </RoleProtectedRoute>
                ),
              },
            ],
          },
          {
            path: 'account/security/password',
            Component: PasswordChangePage,
          },
          {
            path: 'account/security/email',
            Component: EmailVerificationPage,
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
