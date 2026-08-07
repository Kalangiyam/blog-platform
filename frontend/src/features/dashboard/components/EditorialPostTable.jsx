import { Link } from 'react-router'
import PostStatusBadge from '../../posts/components/PostStatusBadge.jsx'

export default function EditorialPostTable({
  posts,
  isEditor,
  pendingActionSlug,
  onPublish,
  onUnpublish,
  onDelete,
  onRestore,
}) {
  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
        No posts found matching the selected filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3" scope="col">Title</th>
            <th className="px-4 py-3" scope="col">Author</th>
            <th className="px-4 py-3" scope="col">Status</th>
            <th className="px-4 py-3" scope="col">Created</th>
            <th className="px-4 py-3 text-right" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {posts.map((post) => {
            const isPending = pendingActionSlug === post.slug

            return (
              <tr className="hover:bg-slate-50 transition" key={post.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  <div className="flex flex-col">
                    <Link
                      className="hover:text-indigo-600 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      to={`/posts/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                    <span className="text-xs text-slate-400">/{post.slug}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {post.author?.username || 'Unknown'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <PostStatusBadge status={post.status} />
                    {post.is_deleted ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                        Deleted
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {!post.is_deleted ? (
                      <>
                        <Link
                          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          to={`/posts/${post.slug}/edit`}
                        >
                          Edit
                        </Link>

                        {post.status === 'draft' ? (
                          <button
                            className="rounded-md border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-50"
                            disabled={isPending}
                            onClick={() => onPublish(post.slug)}
                            type="button"
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                            disabled={isPending}
                            onClick={() => onUnpublish(post.slug)}
                            type="button"
                          >
                            Unpublish
                          </button>
                        )}

                        <button
                          className="rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                          disabled={isPending}
                          onClick={() => onDelete(post.slug)}
                          type="button"
                        >
                          Delete
                        </button>
                      </>
                    ) : isEditor ? (
                      <button
                        className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => onRestore(post.slug)}
                        type="button"
                      >
                        Restore
                      </button>
                    ) : null}
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
