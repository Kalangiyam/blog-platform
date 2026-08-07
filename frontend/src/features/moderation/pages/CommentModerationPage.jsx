import { useCommentModeration } from '../hooks/useCommentModeration.js'
import CommentModerationTable from '../components/CommentModerationTable.jsx'

export default function CommentModerationPage() {
  const {
    data,
    isLoading,
    error,
    page,
    isDeletedFilter,
    pendingActionId,
    setPage,
    setIsDeletedFilter,
    handleDelete,
    handleRestore,
    retry,
  } = useCommentModeration()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Comment Moderation</h2>
          <p className="text-xs text-slate-500">Inspect, soft-delete, or restore user comments across all posts.</p>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            checked={isDeletedFilter}
            className="h-4 w-4 rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500"
            onChange={(e) => setIsDeletedFilter(e.target.checked)}
            type="checkbox"
          />
          Show Deleted Comments
        </label>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">{error.message || 'Failed to load comments.'}</p>
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
        <div aria-label="Loading comments" className="p-12 text-center text-slate-500" role="status">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="mt-2 text-sm">Loading comments...</p>
        </div>
      ) : (
        <>
          <CommentModerationTable
            comments={data?.results || []}
            onDelete={handleDelete}
            onRestore={handleRestore}
            pendingActionId={pendingActionId}
          />

          {data && data.count > 0 ? (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-500">Total: {data.count} comments</span>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={!data.previous}
                  onClick={() => setPage(page - 1)}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={!data.next}
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
