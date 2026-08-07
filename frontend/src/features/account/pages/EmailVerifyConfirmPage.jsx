import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { confirmEmailVerification } from '../api/accountSecurityApi.js'

export default function EmailVerifyConfirmPage() {
  const { uid, token } = useParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [statusMessage, setStatusMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  const isExecutedRef = useRef(false)

  useEffect(() => {
    if (isExecutedRef.current) return
    isExecutedRef.current = true

    async function verify() {
      setIsVerifying(true)
      try {
        const res = await confirmEmailVerification({ uid, token })
        setStatusMessage(res.detail || 'Your email address has been successfully verified.')
        setIsError(false)
      } catch (err) {
        setStatusMessage(err.message || 'Invalid or expired email verification link.')
        setIsError(true)
      } finally {
        setIsVerifying(false)
      }
    }

    verify()
  }, [uid, token])

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs text-center">
        <h1 className="text-xl font-bold text-slate-900">Email Verification</h1>

        {isVerifying ? (
          <div aria-label="Verifying email" className="py-8" role="status">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-600">Verifying your email token...</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div
              className={`rounded-lg p-4 text-sm font-medium ${
                isError
                  ? 'border border-rose-200 bg-rose-50 text-rose-800'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              {statusMessage}
            </div>

            <div className="pt-2">
              <Link
                className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                to="/login"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
