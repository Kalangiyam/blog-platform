import { useState } from 'react'

import { getSafePostImageUrl } from '../../posts/utils/postMedia.js'

export default function FeaturedImagePreview({
  url,
  alt = 'Featured image preview',
  isLocalPreview = false,
  isLoading = false,
  className = '',
}) {
  const [hasError, setHasError] = useState(false)

  if (!url) {
    return null
  }

  const safeUrl = isLocalPreview ? url : getSafePostImageUrl(url)

  if (!safeUrl || hasError) {
    return (
      <div
        className={`flex aspect-[16/9] w-full flex-col items-center justify-center rounded-xl bg-slate-100 p-6 text-slate-400 ${className}`}
        data-testid="featured-image-error-fallback"
      >
        <svg
          aria-hidden="true"
          className="h-10 w-10 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
        <span className="mt-2 text-xs font-medium text-slate-500">
          Image preview unavailable
        </span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-900 ${className}`}>
      <img
        alt={alt}
        className={`aspect-[16/9] w-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-50 blur-xs' : 'opacity-100'
        }`}
        onError={() => setHasError(true)}
        src={safeUrl}
      />
      {isLocalPreview && (
        <span className="absolute top-3 left-3 inline-flex items-center rounded-md bg-indigo-900/80 px-2.5 py-1 text-xs font-medium text-indigo-100 backdrop-blur-xs">
          Draft Preview (Unsaved)
        </span>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 backdrop-blur-2xs">
          <svg
            aria-label="Loading image..."
            className="h-8 w-8 animate-spin text-white"
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
        </div>
      )}
    </div>
  )
}
