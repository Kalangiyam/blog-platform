import { useState } from 'react'
import { Link } from 'react-router'
import { useAccountSecurity } from '../hooks/useAccountSecurity.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { isSubmitting, error, successMessage, handleRequestPasswordReset } = useAccountSecurity()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      await handleRequestPasswordReset({ email: email.trim() })
    } catch {
      // Error handled by hook
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">Reset Password</h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your email address and we will send you password reset instructions.
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
            <label className="block text-xs font-semibold text-slate-700" htmlFor="reset-email">
              Email Address
            </label>
            <input
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none"
              id="reset-email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>

          <button
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-50"
            disabled={isSubmitting || !email.trim()}
            type="submit"
          >
            {isSubmitting ? 'Sending Link...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <Link
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/login"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
