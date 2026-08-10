import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'

import { AUTH_STATUS } from '../features/auth/context/AuthContext.js'
import { useAuth } from '../features/auth/hooks/useAuth.js'
import {
  canCreatePost,
  canManageCategories,
  canManageTags,
  canManageUsers,
  canModerateComment,
  canViewUserAdministration,
} from '../features/permissions/utils/authorizationRules.js'
import {
  getCategories,
  getPublishedPosts,
  getTags,
  POSTS_PAGE_SIZE,
} from '../features/posts/api/postsApi.js'
import { formatPostDate } from '../features/posts/utils/postDates.js'
import { POST_ERROR_CODES } from '../features/posts/utils/postErrors.js'
import {
  getPostsSearch,
  getVisiblePostPages,
  isCanonicalPostsSearch,
  parsePostsPage,
} from '../features/posts/utils/postPagination.js'

function CategoryIcon({ index }) {
  const iconPaths = [
    'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    'M13 10V3L4 14h7v7l9-11h-7z',
    'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
  ]
  const colors = [
    'bg-indigo-600',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-sky-500',
    'bg-purple-600',
  ]

  const path = iconPaths[index % iconPaths.length]
  const color = colors[index % colors.length]

  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${color}`}>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function HomePage() {
  const { status: authStatus, user } = useAuth()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePostsPage(searchParams)
  const categoryFilter = searchParams.get('category') || ''
  const tagFilter = searchParams.get('tag') || ''

  // Scroll to hash anchor (#categories or #tags) when requested from navbar
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.slice(1)
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [location.hash])

  // Posts State
  const [postsRetryKey, setPostsRetryKey] = useState(0)
  const [postsState, setPostsState] = useState({
    requestKey: null,
    status: 'loading',
    data: null,
    errorCode: null,
  })
  const postsRequestKey = `${page}:${categoryFilter}:${tagFilter}:${postsRetryKey}`
  const isPostsLoading = postsState.requestKey === postsRequestKey ? postsState.status === 'loading' : true

  // Categories & Tags State
  const [taxonomiesRetryKey, setTaxonomiesRetryKey] = useState(0)
  const [categoriesState, setCategoriesState] = useState({ status: 'loading', data: [], isError: false })
  const [tagsState, setTagsState] = useState({ status: 'loading', data: [], isError: false })

  // Normalize pagination search param canonical state
  useEffect(() => {
    if (!categoryFilter && !tagFilter && !isCanonicalPostsSearch(searchParams, page)) {
      setSearchParams(getPostsSearch(page), { replace: true })
    }
  }, [page, categoryFilter, tagFilter, searchParams, setSearchParams])

  // Fetch Published Posts from API (passes ?category=slug or ?tag=slug to backend /api/posts/)
  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadPosts() {
      try {
        const data = await getPublishedPosts(page, {
          category: categoryFilter,
          tag: tagFilter,
          signal: controller.signal,
        })

        if (active) {
          setPostsState({
            requestKey: postsRequestKey,
            status: 'success',
            data,
            errorCode: null,
          })
        }
      } catch (error) {
        if (!active || error.code === POST_ERROR_CODES.CANCELLED) {
          return
        }

        if (error.code === POST_ERROR_CODES.INVALID_PAGE && page > 1) {
          setSearchParams('', { replace: true })
          return
        }

        setPostsState({
          requestKey: postsRequestKey,
          status: 'error',
          data: null,
          errorCode: error.code || 'UNKNOWN_ERROR',
        })
      }
    }

    loadPosts()

    return () => {
      active = false
      controller.abort()
    }
  }, [page, categoryFilter, tagFilter, postsRequestKey, setSearchParams])

  // Fetch Categories and Tags independently from API
  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function loadTaxonomies() {
      setCategoriesState((prev) => ({ ...prev, status: 'loading', isError: false }))
      setTagsState((prev) => ({ ...prev, status: 'loading', isError: false }))

      const [catsRes, tagsRes] = await Promise.allSettled([
        getCategories(1, { signal: controller.signal }),
        getTags(1, { signal: controller.signal }),
      ])

      if (!active) return

      if (catsRes.status === 'fulfilled' && catsRes.value) {
        const rawCats = Array.isArray(catsRes.value)
          ? catsRes.value
          : catsRes.value?.results || []
        setCategoriesState({ status: 'success', data: rawCats, isError: false })
      } else if (catsRes.status === 'rejected' && catsRes.reason?.name !== 'AbortError') {
        setCategoriesState({ status: 'error', data: [], isError: true })
      }

      if (tagsRes.status === 'fulfilled' && tagsRes.value) {
        const rawTags = Array.isArray(tagsRes.value)
          ? tagsRes.value
          : tagsRes.value?.results || []
        setTagsState({ status: 'success', data: rawTags, isError: false })
      } else if (tagsRes.status === 'rejected' && tagsRes.reason?.name !== 'AbortError') {
        setTagsState({ status: 'error', data: [], isError: true })
      }
    }

    loadTaxonomies()

    return () => {
      active = false
      controller.abort()
    }
  }, [taxonomiesRetryKey])

  // Posts derived data
  const posts = postsState.data?.results ?? []
  const postsCount = postsState.data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(postsCount / POSTS_PAGE_SIZE))

  // Capability checks
  const canCreate = canCreatePost(user)
  const canManageCats = canManageCategories(user)
  const canManageTgs = canManageTags(user)
  const canModComments = canModerateComment(user)
  const canAdminUsers = canViewUserAdministration(user)
  const canCreateUsers = canManageUsers(user)
  const isAuthorOrEditor = user?.roles?.includes('Author') || user?.roles?.includes('Editor')
  const hasAnyWorkspaceAction =
    canCreate ||
    isAuthorOrEditor ||
    canManageCats ||
    canManageTgs ||
    canModComments ||
    canAdminUsers ||
    canCreateUsers

  return (
    <section className="w-full px-4 py-8 sm:px-6 md:py-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Page Header */}
        <header className="mb-8 border-b border-slate-200/80 pb-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Latest Articles
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-normal">
            Discover the latest articles and insights.
          </p>
        </header>

        {/* Active Taxonomy Filter Notification Banner */}
        {categoryFilter || tagFilter ? (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-xs text-indigo-950 shadow-2xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-slate-600 font-semibold">Active Filter:</span>
              {categoryFilter ? (
                <span className="rounded-md bg-indigo-600 px-2 py-0.5 font-bold text-white uppercase tracking-wider">
                  Category: {categoryFilter}
                </span>
              ) : null}
              {tagFilter ? (
                <span className="rounded-md bg-purple-600 px-2 py-0.5 font-bold text-white">
                  Tag: #{tagFilter}
                </span>
              ) : null}
            </div>
            <Link
              className="font-bold text-indigo-700 hover:text-indigo-900 hover:underline"
              to="/"
            >
              Clear Filter ✕
            </Link>
          </div>
        ) : null}

        {/* Desktop / Mobile Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content Area (Left Column: ~70%) */}
          <main className="lg:col-span-8">
            {/* Posts Loading Skeleton */}
            {isPostsLoading ? (
              <div aria-label="Loading articles" className="flex flex-col gap-5" role="status">
                <span className="sr-only">Loading articles...</span>
                {[1, 2, 3].map((i) => (
                  <div
                    className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6"
                    key={i}
                  >
                    <div className="h-4 w-24 rounded bg-slate-200"></div>
                    <div className="mt-3 h-6 w-3/4 rounded bg-slate-200"></div>
                    <div className="mt-2 h-4 w-full rounded bg-slate-100"></div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-4 w-28 rounded bg-slate-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Posts Error State */}
            {!isPostsLoading && postsState.status === 'error' ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-rose-800">
                <h2 className="text-lg font-bold text-rose-900">Unable to load published articles</h2>
                <p className="mt-1 text-sm text-rose-700">
                  A network or server error occurred while retrieving articles.
                </p>
                <button
                  className="mt-4 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 cursor-pointer"
                  onClick={() => setPostsRetryKey((k) => k + 1)}
                  type="button"
                >
                  Retry request
                </button>
              </div>
            ) : null}

            {/* Posts Empty State */}
            {!isPostsLoading && postsState.status === 'success' && posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <svg
                  aria-hidden="true"
                  className="mx-auto h-12 w-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h2 className="mt-4 text-lg font-bold text-slate-900">No published articles found</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {categoryFilter || tagFilter
                    ? 'No articles match the selected filter.'
                    : 'Published articles will appear here when they are available.'}
                </p>
                {categoryFilter || tagFilter ? (
                  <Link
                    className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    to="/"
                  >
                    Clear Filter
                  </Link>
                ) : null}
              </div>
            ) : null}

            {/* Single-Column Articles List */}
            {!isPostsLoading && postsState.status === 'success' && posts.length > 0 ? (
              <div className="flex flex-col gap-5">
                {posts.map((article) => {
                  const authorName = article.author
                    ? `${article.author.first_name || ''} ${article.author.last_name || ''}`.trim() ||
                      article.author.username ||
                      'Author'
                    : 'Author'

                  return (
                    <article
                      className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                      key={article.id || article.slug}
                    >
                      {/* Categories Badges */}
                      {Array.isArray(article.categories) && article.categories.length > 0 ? (
                        <div className="mb-2.5 flex flex-wrap gap-2">
                          {article.categories.map((cat) => (
                            <Link
                              className="inline-block rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-indigo-700 uppercase transition hover:bg-indigo-100"
                              key={cat.id || cat.slug || cat.name}
                              to={`/?category=${encodeURIComponent(cat.slug || cat.name)}`}
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}

                      {/* Title */}
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-2xl">
                        <Link
                          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          to={`/posts/${encodeURIComponent(article.slug)}`}
                        >
                          {article.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      {article.excerpt ? (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">
                          {article.excerpt}
                        </p>
                      ) : null}

                      {/* Author & Date metadata */}
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                        {article.author?.username ? (
                          <Link
                            className="font-semibold text-slate-800 transition-colors hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            to={`/users/${encodeURIComponent(article.author.username)}`}
                          >
                            {authorName}
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-800">{authorName}</span>
                        )}
                        <span aria-hidden="true" className="text-slate-300">•</span>
                        <time dateTime={article.published_at || undefined}>
                          {formatPostDate(article.published_at)}
                        </time>
                      </div>

                      {/* Tags Chips */}
                      {Array.isArray(article.tags) && article.tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {article.tags.map((tag) => (
                            <Link
                              className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                              key={tag.id || tag.slug || tag.name}
                              to={`/?tag=${encodeURIComponent(tag.slug || tag.name)}`}
                            >
                              #{tag.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            ) : null}

            {/* Pagination Controls */}
            {!isPostsLoading && postsState.status === 'success' && totalPages > 1 ? (
              <nav aria-label="Articles pagination" className="mt-8 flex items-center justify-center gap-1.5">
                {page > 1 ? (
                  <Link
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    to={page - 1 === 1 ? '/' : `/?page=${page - 1}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15.75 19.5 8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ) : (
                  <span aria-disabled="true" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15.75 19.5 8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}

                {getVisiblePostPages(page, totalPages).map((item) =>
                  typeof item === 'string' ? (
                    <span aria-hidden="true" className="px-1 text-slate-400" key={item}>...</span>
                  ) : (
                    <Link
                      aria-current={item === page ? 'page' : undefined}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                        item === page
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                      key={item}
                      to={item === 1 ? '/' : `/?page=${item}`}
                    >
                      <span className="sr-only">Page </span>{item}
                    </Link>
                  ),
                )}

                {page < totalPages ? (
                  <Link
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    to={`/?page=${page + 1}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ) : (
                  <span aria-disabled="true" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </nav>
            ) : null}
          </main>

          {/* Sidebar (Right Column: ~30%) */}
          <aside className="flex flex-col gap-6 lg:col-span-4">
            {/* Workspace Actions Panel (Authenticated Users) */}
            {authStatus === AUTH_STATUS.CHECKING ? (
              <div aria-label="Loading workspace actions" className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs" role="status">
                <div className="h-4 w-32 rounded bg-slate-200"></div>
                <div className="mt-3 h-8 w-full rounded bg-slate-100"></div>
              </div>
            ) : authStatus === AUTH_STATUS.AUTHENTICATED && hasAnyWorkspaceAction ? (
              <section aria-label="Workspace actions" className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2 border-b border-indigo-100/80 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Workspace Actions</h2>
                    <p className="text-xs text-slate-500 font-medium">Quick role management</p>
                  </div>
                  {user?.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <span className="rounded-full bg-indigo-100/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700" key={r}>
                          {r}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3.5 flex flex-col gap-2">
                  {canCreate ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to="/posts/new"
                    >
                      Create Post
                    </Link>
                  ) : null}

                  {isAuthorOrEditor ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to="/dashboard/posts"
                    >
                      Editorial Dashboard
                    </Link>
                  ) : null}

                  {canManageCats ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to="/dashboard/categories"
                    >
                      Manage Categories
                    </Link>
                  ) : null}

                  {canManageTgs ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to="/dashboard/tags"
                    >
                      Manage Tags
                    </Link>
                  ) : null}

                  {canModComments ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to="/dashboard/comments"
                    >
                      Moderate Comments
                    </Link>
                  ) : null}

                  {canAdminUsers ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to="/admin/users"
                    >
                      User Management
                    </Link>
                  ) : null}

                  {canCreateUsers ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to="/admin/users/new"
                    >
                      Add User
                    </Link>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Sidebar Box 1: Categories */}
            <section aria-label="Categories" className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs" id="categories">
              <h3 className="text-base font-bold text-slate-900">Categories</h3>

              {categoriesState.status === 'loading' ? (
                <div aria-label="Loading categories" className="mt-4 flex flex-col gap-2.5" role="status">
                  {[1, 2, 3, 4].map((i) => (
                    <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" key={i}></div>
                  ))}
                </div>
              ) : null}

              {categoriesState.isError ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-center text-xs text-amber-800">
                  <p>Failed to load categories.</p>
                  <button
                    className="mt-2 text-xs font-bold text-amber-900 underline hover:no-underline cursor-pointer"
                    onClick={() => setTaxonomiesRetryKey((k) => k + 1)}
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              {!categoriesState.isError && categoriesState.status === 'success' && categoriesState.data.length === 0 ? (
                <p className="mt-4 text-xs text-slate-500">No categories are available.</p>
              ) : null}

              {!categoriesState.isError && categoriesState.status === 'success' && categoriesState.data.length > 0 ? (
                <div className="mt-4 flex flex-col gap-2">
                  {categoriesState.data.map((cat, idx) => (
                    <Link
                      className="group flex items-center justify-between rounded-xl p-2 text-slate-800 transition-all hover:bg-indigo-50/70 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      key={cat.id || cat.slug || cat.name}
                      to={`/?category=${encodeURIComponent(cat.slug || cat.name)}`}
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIcon index={idx} />
                        <span className="text-sm font-semibold transition-colors group-hover:text-indigo-600">
                          {cat.name}
                        </span>
                      </div>
                      <svg
                        className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="m8.25 4.5 7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>

            {/* Sidebar Box 2: Explore Tags */}
            <section aria-label="Explore Tags" className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs" id="tags">
              <h3 className="text-base font-bold text-slate-900">Explore Tags</h3>

              {tagsState.status === 'loading' ? (
                <div aria-label="Loading tags" className="mt-4 flex flex-wrap gap-2" role="status">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div className="h-7 w-16 animate-pulse rounded-lg bg-slate-100" key={i}></div>
                  ))}
                </div>
              ) : null}

              {tagsState.isError ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-center text-xs text-amber-800">
                  <p>Failed to load tags.</p>
                  <button
                    className="mt-2 text-xs font-bold text-amber-900 underline hover:no-underline cursor-pointer"
                    onClick={() => setTaxonomiesRetryKey((k) => k + 1)}
                    type="button"
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              {!tagsState.isError && tagsState.status === 'success' && tagsState.data.length === 0 ? (
                <p className="mt-4 text-xs text-slate-500">No tags are available.</p>
              ) : null}

              {!tagsState.isError && tagsState.status === 'success' && tagsState.data.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tagsState.data.map((tag) => (
                    <Link
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:border-indigo-300 hover:bg-indigo-50/80 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      key={tag.id || tag.slug || tag.name}
                      to={`/?tag=${encodeURIComponent(tag.slug || tag.name)}`}
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default HomePage
