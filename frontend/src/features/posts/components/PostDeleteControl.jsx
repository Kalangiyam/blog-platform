import { useState } from 'react'

export default function PostDeleteControl({
  postTitle = 'this post',
  onDelete,
  isSubmitting = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = async () => {
    if (!onDelete) return
    await onDelete()
    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || isSubmitting}
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer"
      >
        Delete Post
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-100">
              Confirm Soft Deletion
            </h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">&ldquo;{postTitle}&rdquo;</span>? This post will be removed from public listings.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
