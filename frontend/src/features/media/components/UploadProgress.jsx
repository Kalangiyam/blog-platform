export default function UploadProgress({
  progress = 0,
  onCancel,
  isUploading = false,
}) {
  if (!isUploading && progress === 0) {
    return null
  }

  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full rounded-xl bg-slate-50 p-4 border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Uploading image...
        </span>
        <span className="font-mono text-indigo-700">{clampedProgress}%</span>
      </div>

      <div
        aria-label="Image upload progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={clampedProgress}
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {onCancel && (
        <div className="mt-3 flex justify-end">
          <button
            className="text-xs font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={onCancel}
            type="button"
          >
            Cancel upload
          </button>
        </div>
      )}
    </div>
  )
}
