import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { useAuth } from '../../auth/hooks/useAuth.js'
import { FeaturedImageUploader } from '../../media/index.js'
import CommentsSection from '../../comments/components/CommentsSection.jsx'
import { getPublishedPost } from '../api/postsApi.js'
import PostImage from '../components/PostImage.jsx'
import PostRequestError from '../components/PostRequestError.jsx'
import PostTaxonomy from '../components/PostTaxonomy.jsx'
import { formatPostDate } from '../utils/postDates.js'
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
  const { user, isAuthenticated, hasRole } = useAuth()
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
      <section aria-live="polite" className="grid w-full place-items-center px-6 py-16" role="status">
        Loading post...
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
  const canManageImage = Boolean(
    isAuthenticated &&
      ((user?.username && post?.author?.username && user.username === post.author.username) ||
        hasRole('Editor')),
  )

  const handleImageUploaded = (newUrl) => {
    setState((prev) => ({
      ...prev,
      post: prev.post ? { ...prev.post, featured_image_url: newUrl } : prev.post,
    }))
  }

  const handleImageRemoved = () => {
    setState((prev) => ({
      ...prev,
      post: prev.post ? { ...prev.post, featured_image_url: null } : prev.post,
    }))
  }

  return (
    <article className="w-full px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-10">
        <Link className="text-sm font-semibold text-indigo-700 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/posts">Back to all posts</Link>

        <header>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
            <span>
              By{' '}
              {post.author?.username ? (
                <Link
                  className="font-semibold text-indigo-700 hover:underline hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  to={`/users/${post.author.username}`}
                >
                  {post.author.username}
                </Link>
              ) : (
                'Unknown author'
              )}
            </span>
            <span aria-hidden="true">/</span>
            <time dateTime={post.published_at || undefined}>{formatPostDate(post.published_at)}</time>
          </div>
          {post.excerpt ? <p className="mt-6 text-xl leading-8 text-slate-600">{post.excerpt}</p> : null}
          <div className="mt-6"><PostTaxonomy categories={post.categories} tags={post.tags} /></div>
        </header>

        {canManageImage && (
          <section aria-label="Author featured image management">
            <FeaturedImageUploader
              initialImageUrl={post.featured_image_url}
              onRemoveSuccess={handleImageRemoved}
              onUploadSuccess={handleImageUploaded}
              postSlug={post.slug}
            />
          </section>
        )}

        <PostImage className="aspect-[16/9] w-full rounded-2xl" title={post.title} url={post.featured_image_url} />

        <div className="whitespace-pre-wrap text-lg leading-8 text-slate-700">{post.content}</div>

        <CommentsSection postSlug={post.slug} />
      </div>
    </article>
  )
}

export default PostDetailPage

