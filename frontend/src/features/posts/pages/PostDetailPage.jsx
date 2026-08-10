import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import CommentsSection from '../../comments/components/CommentsSection.jsx'
import { useAuthorization } from '../../permissions/index.js'
import { getPublishedPost } from '../api/postsApi.js'
import PostRequestError from '../components/PostRequestError.jsx'
import PostArticleBody from '../components/detail/PostArticleBody.jsx'
import PostBreadcrumbs from '../components/detail/PostBreadcrumbs.jsx'
import PostFeaturedImage from '../components/detail/PostFeaturedImage.jsx'
import PostHeader from '../components/detail/PostHeader.jsx'
import PostSidebar from '../components/detail/PostSidebar.jsx'
import { POST_ERROR_CODES } from '../utils/postErrors.js'

export function PostNotFound() {
  return (
    <section className="grid w-full place-items-center px-6 py-16">
      <div className="max-w-xl text-center">
        <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase">404 Error</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Post not found</h1>
        <p className="mt-4 leading-7 text-slate-600">This post does not exist or is no longer publicly available.</p>
        <Link className="mt-7 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/posts">
          Browse posts
        </Link>
      </div>
    </section>
  )
}

function PostDetailPage() {
  const { postSlug } = useParams()
  const { canEditPost } = useAuthorization()
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState({
    requestKey: null,
    status: 'loading',
    post: null,
    errorCode: null,
  })
  const requestKey = `${postSlug}:${retryKey}`
  const status = state.requestKey === requestKey ? state.status : 'loading'

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadPost() {
      try {
        const post = await getPublishedPost(postSlug, {
          signal: controller.signal,
        })

        if (active) {
          setState({ requestKey, status: 'success', post, errorCode: null })
        }
      } catch (error) {
        if (active && error.code !== POST_ERROR_CODES.CANCELLED) {
          setState({ requestKey, status: 'error', post: null, errorCode: error.code })
        }
      }
    }

    loadPost()

    return () => {
      active = false
      controller.abort()
    }
  }, [postSlug, requestKey])

  if (status === 'loading') {
    return (
      <section aria-live="polite" className="grid w-full place-items-center px-6 py-24 text-slate-600 font-medium" role="status">
        Loading article...
      </section>
    )
  }

  if (status === 'error' && state.errorCode === POST_ERROR_CODES.NOT_FOUND) {
    return <PostNotFound />
  }

  if (status === 'error') {
    return (
      <section className="w-full px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <PostRequestError error={{ code: state.errorCode }} onRetry={() => setRetryKey((key) => key + 1)} />
        </div>
      </section>
    )
  }

  const post = state.post
  const isEditable = canEditPost(post)
  const primaryCategory = Array.isArray(post?.categories) && post.categories.length > 0 ? post.categories[0] : null

  return (
    <article className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Full-width Breadcrumb Navigation */}
        <PostBreadcrumbs category={primaryCategory} title={post.title} />

        {/* Desktop 12-Column Grid (Bounded to Blog Article height so Sidebar un-sticks when Article ends) */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Main Article Content Column */}
          <main className="space-y-8 lg:col-span-8 max-w-3xl">
            {/* Header: Badge, Title, Excerpt, Author/Date, Edit Button, Tags */}
            <PostHeader isEditable={isEditable} post={post} />

            {/* Optional Featured Image Hero (collapses cleanly if missing or onError) */}
            <PostFeaturedImage title={post.title} url={post.featured_image_url} />

            {/* Article Content Typography */}
            <PostArticleBody content={post.content} />
          </main>

          {/* Sidebar Column (Sticky until Blog Article ends) */}
          <div className="lg:col-span-4">
            <PostSidebar post={post} />
          </div>
        </div>

        {/* Comments Section (Positioned below Blog Article Grid) */}
        <div className="max-w-3xl">
          <CommentsSection postSlug={post.slug} />
        </div>
      </div>
    </article>
  )
}

export default PostDetailPage
