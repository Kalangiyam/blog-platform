import { Link } from 'react-router'
import { useEditorialPosts } from '../hooks/useEditorialPosts.js'
import EditorialPostTable from '../components/EditorialPostTable.jsx'
import { useAuthorization } from '../../permissions/hooks/useAuthorization.js'

export default function EditorialPostsPage() {
  const { isEditor, canCreatePost } = useAuthorization()
  const {
    postsData,
    isLoading,
    error,
    page,
    statusFilter,
    isDeletedFilter,
    pendingActionSlug,
    setPage,
    setStatusFilter,
    setIsDeletedFilter,
    handlePublish,
    handleUnpublish,
    handleDelete,
    handleRestore,
    retry,
  } = useEditorialPosts()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="sr-only" htmlFor="status-filter">Filter by status</label>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none"
              id="status-filter"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
            </select>
          </div>

          {isEditor ? (
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                checked={isDeletedFilter}
                className="h-4 w-4 rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500"
                onChange={(e) => setIsDeletedFilter(e.target.checked)}
                type="checkbox"
              />
              Show Deleted Posts
            </label>
          ) : null}
        </div>

        {canCreatePost() ? (
          <Link
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/posts/new"
          >
            + Create New Post
          </Link>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">{error.message || 'Failed to load posts.'}</p>
          <button
            className="mt-2 text-xs font-semibold text-rose-800 underline hover:text-rose-900"
            onClick={retry}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div aria-label="Loading posts" className="p-12 text-center text-slate-500" role="status">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="mt-2 text-sm">Loading posts...</p>
        </div>
      ) : (
        <>
          <EditorialPostTable
            isEditor={isEditor}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onRestore={handleRestore}
            onUnpublish={handleUnpublish}
            pendingActionSlug={pendingActionSlug}
            posts={postsData?.results || []}
          />

          {postsData && postsData.count > 0 ? (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-500">
                Total: {postsData.count} posts
              </span>

              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={!postsData.previous}
                  onClick={() => setPage(page - 1)}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={!postsData.next}
                  onClick={() => setPage(page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
