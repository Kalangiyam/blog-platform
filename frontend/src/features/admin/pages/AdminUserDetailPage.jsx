import { Link, useLocation, useParams } from 'react-router'

import AdminUserError from '../components/AdminUserError.jsx'
import UserActivationControls from '../components/UserActivationControls.jsx'
import UserRoleEditor from '../components/UserRoleEditor.jsx'
import UserSummary from '../components/UserSummary.jsx'
import { useAdminUserDetail } from '../hooks/useAdminUserDetail.js'
import { ADMIN_USER_ERROR_CODES } from '../utils/normalizeAdminUserError.js'

export default function AdminUserDetailPage() {
  const { userId } = useParams()
  const location = useLocation()
  const successStateMessage = location.state?.message

  const {
    user,
    isLoading,
    isPending,
    error,
    mutationError,
    roleSuccessMessage,
    activate,
    deactivate,
    updateRoles,
    refetch,
  } = useAdminUserDetail(userId)

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/admin/users"
          >
            &larr; Back to User List
          </Link>
        </div>

        {successStateMessage ? (
          <div
            aria-live="polite"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
            role="status"
          >
            {successStateMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div aria-label="Loading user details" className="space-y-4 py-8" role="status">
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none" />
            <div className="h-40 w-full animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
            <div className="h-32 w-full animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
          </div>
        ) : error ? (
          <AdminUserError
            message={error.message}
            onRetry={error.code !== ADMIN_USER_ERROR_CODES.NOT_FOUND ? refetch : undefined}
            title={
              error.code === ADMIN_USER_ERROR_CODES.NOT_FOUND
                ? 'User Not Found'
                : 'Error Loading User Details'
            }
          />
        ) : user ? (
          <>
            <UserSummary user={user} />
            <UserActivationControls
              error={mutationError}
              isPending={isPending}
              onActivate={activate}
              onDeactivate={deactivate}
              user={user}
            />
            <UserRoleEditor
              currentRoles={user.roles || []}
              error={mutationError}
              isSaving={isPending}
              onSave={updateRoles}
              successMessage={roleSuccessMessage}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
