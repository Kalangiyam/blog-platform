import { Link } from 'react-router'

export default function CommentModerationTable({
  comments,
  pendingActionId,
  onDelete,
  onRestore,
}) {
  if (!comments || comments.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
        No comments found matching the selected filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3" scope="col">Comment</th>
            <th className="px-4 py-3" scope="col">Author</th>
            <th className="px-4 py-3" scope="col">Post</th>
            <th className="px-4 py-3" scope="col">Status</th>
            <th className="px-4 py-3 text-right" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {comments.map((comment) => {
            const isPending = pendingActionId === comment.id

            return (
              <tr className="hover:bg-slate-50 transition" key={comment.id}>
                <td className="px-4 py-3 text-slate-900 max-w-xs truncate">
                  {comment.content}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {comment.author?.username || 'Anonymous'}
                </td>
                <td className="px-4 py-3 text-indigo-600 max-w-xs truncate">
                  {comment.post_slug ? (
                    <Link
                      className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to={`/posts/${comment.post_slug}`}
                    >
                      {comment.post_title || comment.post_slug}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {comment.is_deleted ? (
                    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                      Deleted
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {!comment.is_deleted ? (
                      <button
                        className="rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => onDelete(comment.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => onRestore(comment.id)}
                        type="button"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
