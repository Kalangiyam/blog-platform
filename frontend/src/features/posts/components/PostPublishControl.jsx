import { useState } from 'react'

export default function PostPublishControl({
  status = 'draft',
  onPublish,
  onUnpublish,
  isSubmitting = false,
  disabled = false,
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const isPublished = status === 'published'

  const handleActionClick = () => {
    setShowConfirm(true)
  }

  const handleConfirmAction = async () => {
    setShowConfirm(false)
    if (isPublished) {
      if (onUnpublish) await onUnpublish()
    } else {
      if (onPublish) await onPublish()
    }
  }

  return (
    <div className="inline-block">
      {!showConfirm ? (
        <button
          type="button"
          disabled={disabled || isSubmitting}
          onClick={handleActionClick}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            isPublished
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
          } ${disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isSubmitting
            ? 'Processing...'
            : isPublished
            ? 'Unpublish Post'
            : 'Publish Post'}
        </button>
      ) : (
        <div className="flex items-center gap-2 p-2 rounded-md bg-slate-900 border border-slate-700 text-xs">
          <span className="text-slate-300 font-medium">
            {isPublished ? 'Unpublish post?' : 'Publish post now?'}
          </span>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmAction}
            className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors"
          >
            Confirm
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowConfirm(false)}
            className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
