export default function PostStatusBadge({ status }) {
  const isPublished = status === 'published'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isPublished
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isPublished ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
        aria-hidden="true"
      />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}
