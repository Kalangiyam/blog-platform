import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import {
  getPublishedPosts,
  POSTS_PAGE_SIZE,
} from '../api/postsApi.js'
import PostCard from '../components/PostCard.jsx'
import PostPagination from '../components/PostPagination.jsx'
import PostRequestError from '../components/PostRequestError.jsx'
import { POST_ERROR_CODES } from '../utils/postErrors.js'
import {
  getPostsSearch,
  isCanonicalPostsSearch,
  parsePostsPage,
} from '../utils/postPagination.js'

function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePostsPage(searchParams)
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState({
    requestKey: null,
    status: 'loading',
    data: null,
    errorCode: null,
  })
  const requestKey = `${page}:${retryKey}`
  const status = state.requestKey === requestKey ? state.status : 'loading'

  useEffect(() => {
    if (!isCanonicalPostsSearch(searchParams, page)) {
      setSearchParams(getPostsSearch(page), { replace: true })
    }
  }, [page, searchParams, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadPosts() {
      try {
        const data = await getPublishedPosts(page, {
          signal: controller.signal,
        })

        if (active) {
          setState({ requestKey, status: 'success', data, errorCode: null })
        }
      } catch (error) {
        if (!active || error.code === POST_ERROR_CODES.CANCELLED) {
          return
        }

        if (error.code === POST_ERROR_CODES.INVALID_PAGE && page > 1) {
          setSearchParams('', { replace: true })
          return
        }

        setState({ requestKey, status: 'error', data: null, errorCode: error.code })
      }
    }

    loadPosts()

    return () => {
      active = false
      controller.abort()
    }
  }, [page, requestKey, setSearchParams])

  const posts = state.data?.results ?? []

  return (
    <section className="w-full px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 max-w-3xl">
          <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase">Published writing</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Latest posts</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">Browse articles published by the Blog Platform community.</p>
        </header>

        {status === 'loading' ? (
          <div aria-live="polite" className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600" role="status">
            Loading published posts...
          </div>
        ) : null}

        {status === 'error' ? (
          <PostRequestError error={{ code: state.errorCode }} onRetry={() => setRetryKey((key) => key + 1)} />
        ) : null}

        {status === 'success' && posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">No published posts yet</h2>
            <p className="mt-2 text-slate-600">Published articles will appear here when they are available.</p>
          </div>
        ) : null}

        {status === 'success' && posts.length > 0 ? (
          <>
            <div className="grid gap-7 md:grid-cols-2">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
            <PostPagination
              count={state.data.count}
              currentPage={page}
              pageSize={POSTS_PAGE_SIZE}
            />
          </>
        ) : null}
      </div>
    </section>
  )
}

export default PostListPage
