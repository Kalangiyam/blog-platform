import { useState } from 'react'

import { getSafePostImageUrl } from '../utils/postMedia.js'

function PostImage({ title, url, className = '' }) {
  const safeUrl = getSafePostImageUrl(url)
  const [failedUrl, setFailedUrl] = useState(null)
  const failed = safeUrl === failedUrl

  if (!safeUrl || failed) {
    return (
      <div
        aria-label="Featured image unavailable"
        className={`grid place-items-center bg-slate-100 text-sm font-medium text-slate-500 ${className}`}
        role="img"
      >
        No image available
      </div>
    )
  }

  return (
    <img
      alt={`Featured image for ${title}`}
      className={`object-cover ${className}`}
      onError={() => setFailedUrl(safeUrl)}
      src={safeUrl}
    />
  )
}

export default PostImage
