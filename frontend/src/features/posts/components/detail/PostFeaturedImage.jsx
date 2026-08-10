import { useState } from 'react'
import { getSafePostImageUrl } from '../../utils/postMedia.js'

function PostFeaturedImage({ url, title }) {
  const safeUrl = getSafePostImageUrl(url)
  const [failedUrl, setFailedUrl] = useState(null)
  const failed = safeUrl === failedUrl

  if (!safeUrl || failed) {
    return null
  }

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-xs">
      <img
        alt={`Featured image for ${title || 'article'}`}
        className="h-auto max-h-[480px] w-full object-cover"
        onError={() => setFailedUrl(safeUrl)}
        src={safeUrl}
      />
    </figure>
  )
}

export default PostFeaturedImage
