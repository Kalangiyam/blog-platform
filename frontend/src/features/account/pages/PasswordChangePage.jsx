import { useState } from 'react'
import { useAccountSecurity } from '../hooks/useAccountSecurity.js'

export default function PasswordChangePage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { isSubmitting, error, successMessage, handleChangePassword } = useAccountSecurity()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) return

    try {
      await handleChangePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      // Error handled by hook
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">Change Password</h1>
        <p className="mt-1 text-xs text-slate-500">
          Update your account password. Changing your password will invalidate existing sessions.
        </p>

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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700" htmlFor="current-password">
              Current Password
            </label>
            <input
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none"
              id="current-password"
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              type="password"
              value={currentPassword}
            />
            {error?.fieldErrors?.current_password ? (
              <p className="mt-1 text-xs text-rose-600">{error.fieldErrors.current_password}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700" htmlFor="new-password">
              New Password
            </label>
            <input
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none"
              id="new-password"
              onChange={(e) => setNewPassword(e.target.value)}
              required
              type="password"
              value={newPassword}
            />
            {error?.fieldErrors?.new_password ? (
              <p className="mt-1 text-xs text-rose-600">{error.fieldErrors.new_password}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700" htmlFor="confirm-password">
              Confirm New Password
            </label>
            <input
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none"
              id="confirm-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
            {error?.fieldErrors?.confirm_password ? (
              <p className="mt-1 text-xs text-rose-600">{error.fieldErrors.confirm_password}</p>
            ) : null}
          </div>

          <button
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-50"
            disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
            type="submit"
          >
            {isSubmitting ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
