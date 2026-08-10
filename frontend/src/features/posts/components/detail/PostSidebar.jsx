import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getPublishedPosts } from '../../api/postsApi.js'
import { formatPostDate } from '../../utils/postDates.js'

function PostSidebar({ post }) {
  const [copied, setCopied] = useState(false)
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(null)

  const categories = Array.isArray(post?.categories) ? post.categories : []
  const activeCategory =
    categories.find((c) => c.slug === selectedCategorySlug) || categories[0] || null

  const [relatedState, setRelatedState] = useState({
    status: 'idle',
    posts: [],
    count: 0,
  })

  // Fetch related posts from the selected category
  useEffect(() => {
    if (!activeCategory?.slug || !post?.slug) return

    const controller = new AbortController()
    let active = true

    async function loadRelatedPosts() {
      setRelatedState((prev) => ({ ...prev, status: 'loading' }))
      try {
        const response = await getPublishedPosts(1, {
          category: activeCategory.slug,
          pageSize: 10,
          signal: controller.signal,
        })

        if (active) {
          const results = Array.isArray(response?.results) ? response.results : []
          const totalCount = typeof response?.count === 'number' ? response.count : results.length
          const filtered = results
            .filter((p) => p.slug !== post.slug)
            .slice(0, 3)

          setRelatedState({
            status: 'success',
            posts: filtered,
            count: totalCount,
          })
        }
      } catch {
        if (active) {
          setRelatedState({
            status: 'error',
            posts: [],
            count: 0,
          })
        }
      }
    }

    loadRelatedPosts()

    return () => {
      active = false
      controller.abort()
    }
  }, [activeCategory?.slug, post?.slug])

  // Copy canonical URL handler
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

  // Social share URLs
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedTitle = encodeURIComponent(post?.title || '')

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`

  // Determine if updated_at is meaningfully different from created_at (> 1 min)
  const hasMeaningfulUpdate =
    post?.updated_at &&
    post?.created_at &&
    Math.abs(new Date(post.updated_at).getTime() - new Date(post.created_at).getTime()) > 60000

  // Show "View all in Category" button only when total posts in category exceeds 3
  const showViewAllButton = relatedState.status === 'success' && relatedState.count > 3

  return (
    <aside aria-label="Article information and related content" className="space-y-6 lg:sticky lg:top-24">
      {/* 1. Article Information Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase mb-4 pb-2 border-b border-slate-100">
          Article Info
        </h2>
        <dl className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 font-medium text-slate-500">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Published</span>
            </dt>
            <dd className="font-semibold text-slate-800">
              {formatPostDate(post?.published_at)}
            </dd>
          </div>

          {hasMeaningfulUpdate ? (
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 font-medium text-slate-500">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Last Updated</span>
              </dt>
              <dd className="font-semibold text-slate-800">
                {formatPostDate(post.updated_at)}
              </dd>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 font-medium text-slate-500">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Author</span>
            </dt>
            <dd className="font-semibold text-slate-800">
              {post?.author?.username ? (
                <Link
                  className="text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  to={`/users/${post.author.username}`}
                >
                  {post.author.username}
                </Link>
              ) : (
                'Unknown'
              )}
            </dd>
          </div>

          {/* Renders all categories assigned to the post */}
          {categories.length > 0 ? (
            <div className="flex items-start justify-between gap-2">
              <dt className="flex items-center gap-1.5 font-medium text-slate-500 shrink-0">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{categories.length > 1 ? 'Categories' : 'Category'}</span>
              </dt>
              <dd className="font-semibold text-right flex flex-wrap justify-end gap-1">
                {categories.map((cat, idx) => (
                  <span key={cat.slug}>
                    <Link
                      className="text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to={`/?category=${encodeURIComponent(cat.slug)}`}
                    >
                      {cat.name}
                    </Link>
                    {idx < categories.length - 1 ? <span className="text-slate-400 font-normal">, </span> : null}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>


      {/* 2. More from this category Card */}
      {activeCategory ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase mb-3 pb-2 border-b border-slate-100">
            More from {activeCategory.name}
          </h2>

          {/* Category Tabs (if post has multiple categories) */}
          {categories.length > 1 ? (
            <div aria-label="Select category for related articles" className="flex flex-wrap gap-1.5 mb-4">
              {categories.map((cat) => {
                const isActive = cat.slug === activeCategory.slug
                return (
                  <button
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    key={cat.slug}
                    onClick={() => setSelectedCategorySlug(cat.slug)}
                    type="button"
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          ) : null}

          {relatedState.status === 'loading' ? (
            <div aria-live="polite" className="py-4 text-center text-xs text-slate-400" role="status">
              Loading related articles...
            </div>
          ) : relatedState.posts.length > 0 ? (
            <div className="space-y-4 divide-y divide-slate-100">
              {relatedState.posts.map((relPost) => (
                <div className="pt-3 first:pt-0" key={relPost.id}>
                  <Link
                    className="group block space-y-1"
                    to={`/posts/${relPost.slug}`}
                  >
                    <h3 className="text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600 line-clamp-2">
                      {relPost.title}
                    </h3>
                    {relPost.excerpt ? (
                      <p className="text-xs text-slate-500 line-clamp-2 font-normal">
                        {relPost.excerpt}
                      </p>
                    ) : null}
                    <time dateTime={relPost.published_at || undefined} className="block text-[11px] font-medium text-slate-400 pt-0.5">
                      {formatPostDate(relPost.published_at)}
                    </time>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center">
              <p className="text-xs font-medium text-slate-500">
                There are no other published articles in <span className="font-semibold text-slate-700">{activeCategory.name}</span> yet.
              </p>
            </div>
          )}

          {/* Render "View all in Category" button ONLY if total posts in this category > 3 */}
          {showViewAllButton ? (
            <div className="mt-4 pt-3 border-t border-slate-100 text-right">
              <Link
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                to={`/?category=${encodeURIComponent(activeCategory.slug)}`}
              >
                <span>View all in {activeCategory.name}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 3. Share Article Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase mb-4 pb-2 border-b border-slate-100">
          Share this article
        </h2>
        <div className="flex items-center gap-2">
          {/* Twitter / X */}
          <a
            aria-label="Share on X (Twitter)"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            href={twitterShareUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            aria-label="Share on LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            href={linkedinShareUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
            </svg>
          </a>

          {/* Copy Link Action */}
          <button
            aria-label="Copy article link"
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={handleCopyLink}
            type="button"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span aria-live="polite">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

    </aside>
  )
}

export default PostSidebar
