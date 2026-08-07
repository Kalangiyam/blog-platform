import { useEffect, useRef, useState } from 'react'

import UserStatusBadge from './UserStatusBadge.jsx'

/**
 * Component providing account activation & deactivation controls.
 * Features an accessible modal confirmation dialog for deactivation.
 *
 * @param {Object} props
 * @param {Object} props.user
 * @param {boolean} props.user.is_active
 * @param {string} props.user.username
 * @param {Function} props.onActivate Callback returning Promise<void>
 * @param {Function} props.onDeactivate Callback returning Promise<void>
 * @param {boolean} [props.isPending=false]
 * @param {Object} [props.error=null] Normalized error object
 */
export default function UserActivationControls({
  user,
  onActivate,
  onDeactivate,
  isPending = false,
  error = null,
}) {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const deactivateButtonRef = useRef(null)
  const modalConfirmRef = useRef(null)

  // Focus restoration on modal close
  useEffect(() => {
    if (showDeactivateModal) {
      modalConfirmRef.current?.focus()
    } else {
      deactivateButtonRef.current?.focus()
    }
  }, [showDeactivateModal])

  // Escape key handler for confirmation modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && showDeactivateModal) {
        setShowDeactivateModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showDeactivateModal])

  async function handleConfirmDeactivate() {
    setShowDeactivateModal(false)
    await onDeactivate()
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Account Lifecycle & Status</h3>
          <p className="mt-1 text-xs text-slate-500">
            Manage operational status for user account <strong className="text-slate-800">{user.username}</strong>.
          </p>
        </div>
        <UserStatusBadge isActive={user.is_active} />
      </div>

      {error?.message ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {user.is_active
            ? 'Account is currently active and can authenticate.'
            : 'Account is currently inactive and blocked from logging in.'}
        </p>

        {user.is_active ? (
          <button
            className="inline-flex items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-xs transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            onClick={() => setShowDeactivateModal(true)}
            ref={deactivateButtonRef}
            type="button"
          >
            {isPending ? 'Processing…' : 'Deactivate Account'}
          </button>
        ) : (
          <button
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isPending}
            onClick={onActivate}
            type="button"
          >
            {isPending ? 'Processing…' : 'Activate Account'}
          </button>
        )}
      </div>

      {/* Deactivation Confirmation Modal */}
      {showDeactivateModal ? (
        <div
          aria-labelledby="deactivate-dialog-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h4 className="text-xl font-bold text-slate-900" id="deactivate-dialog-title">
              Confirm Account Deactivation
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to deactivate account <strong className="text-slate-900">{user.username}</strong>?
              Deactivated users cannot log in or perform actions until reactivated by an Administrator.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => setShowDeactivateModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                onClick={handleConfirmDeactivate}
                ref={modalConfirmRef}
                type="button"
              >
                Yes, Deactivate User
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
