import { useAuth } from '../../auth/hooks/useAuth.js'
import { useAccountSecurity } from '../hooks/useAccountSecurity.js'

export default function EmailVerificationPage() {
  const { user } = useAuth()
  const { isSubmitting, error, successMessage, handleResendEmailVerification } = useAccountSecurity()

  const isVerified = Boolean(user?.is_email_verified)

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">Email Verification</h1>
        <p className="mt-1 text-xs text-slate-500">
          Check your account email verification status and request a verification link.
        </p>

        <div className="mt-6 flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-slate-200">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Account Email
            </span>
            <span className="text-sm font-medium text-slate-900">{user?.email || 'N/A'}</span>
          </div>

          <div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                ✓ Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Unverified
              </span>
            )}
          </div>
        </div>

        {successMessage ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            {successMessage}
          </div>
        ) : null}

        {error?.message ? (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
            {error.message}
          </div>
        ) : null}

        {!isVerified ? (
          <div className="mt-6">
            <button
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-50"
              disabled={isSubmitting}
              onClick={handleResendEmailVerification}
              type="button"
            >
              {isSubmitting ? 'Sending Link...' : 'Resend Verification Email'}
            </button>
          </div>
        ) : (
          <p className="mt-6 text-center text-xs text-slate-500">
            Your email address is fully verified. No further action is needed.
          </p>
        )}
      </div>
    </div>
  )
}
