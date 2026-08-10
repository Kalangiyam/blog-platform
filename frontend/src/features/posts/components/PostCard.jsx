import { Link } from 'react-router'

import { formatPostDate } from '../utils/postDates.js'
import PostImage from './PostImage.jsx'
import PostTaxonomy from './PostTaxonomy.jsx'

function PostCard({ post }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <PostImage
        className="aspect-[16/9] w-full"
        title={post.title}
        url={post.featured_image_url}
      />

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
          {post.author?.username ? (
            <Link
              className="font-semibold text-slate-700 hover:text-indigo-600 transition"
              to={`/users/${encodeURIComponent(post.author.username)}`}
            >
              By {post.author.first_name ? `${post.author.first_name} ${post.author.last_name || ''}`.trim() : post.author.username}
            </Link>
          ) : (
            <span>By Unknown author</span>
          )}
          <span aria-hidden="true">/</span>
          <time dateTime={post.published_at || undefined}>
            {formatPostDate(post.published_at)}
          </time>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          <Link
            className="transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
            to={`/posts/${encodeURIComponent(post.slug)}`}
          >
            {post.title}
          </Link>
        </h2>

        {post.excerpt ? (
          <p className="line-clamp-3 leading-7 text-slate-600">{post.excerpt}</p>
        ) : null}

        <PostTaxonomy categories={post.categories} tags={post.tags} />
      </div>
    </article>
  )
}

export default PostCard
