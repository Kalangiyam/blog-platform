import { Link } from 'react-router'
import { formatPostDate } from '../../utils/postDates.js'

function PostHeader({ post, isEditable = false }) {
  if (!post) return null

  const categories = Array.isArray(post.categories) ? post.categories : []
  const authorUsername = post.author?.username

  return (
    <header className="space-y-4">
      {/* Category Badges (Renders all categories assigned to the post) */}
      {categories.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <Link
              className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 uppercase tracking-wider"
              key={cat.slug}
              to={`/?category=${encodeURIComponent(cat.slug)}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Main Title */}
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-[1.15]">
        {post.title}
      </h1>

      {/* Excerpt */}
      {post.excerpt ? (
        <p className="text-lg text-slate-600 sm:text-xl leading-relaxed font-normal">
          {post.excerpt}
        </p>
      ) : null}

      {/* Publication Metadata & Permission-Aware Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-4 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
          <span>
            By{' '}
            {authorUsername ? (
              <Link
                className="font-semibold text-slate-900 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                to={`/users/${authorUsername}`}
              >
                {authorUsername}
              </Link>
            ) : (
              <span className="font-semibold text-slate-900">Unknown author</span>
            )}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            •
          </span>
          <time dateTime={post.published_at || undefined} className="font-medium text-slate-500">
            {formatPostDate(post.published_at)}
          </time>
        </div>

        {/* Permission-Aware Edit Action */}
        {isEditable ? (
          <Link
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to={`/posts/${post.slug}/edit`}
          >
            <svg
              className="h-3.5 w-3.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Edit Post</span>
          </Link>
        ) : null}
      </div>

      {/* Tag Chips */}
      {Array.isArray(post.tags) && post.tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {post.tags.map((tag) => (
            <Link
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              key={tag.slug}
              to={`/?tag=${encodeURIComponent(tag.slug)}`}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  )
}

export default PostHeader
