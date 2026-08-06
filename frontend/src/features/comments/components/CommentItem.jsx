import { useState } from 'react'

import { formatPostDate } from '../../posts/utils/postDates.js'
import { useAuthorization } from '../../permissions/index.js'

const MAX_COMMENT_LENGTH = 2000

export default function CommentItem({
  comment,
  onUpdateComment,
  onDeleteComment,
}) {
  const { canEditComment, canDeleteComment } = useAuthorization()
  const isOwner = canEditComment(comment) || canDeleteComment(comment)

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditContent(comment.content)
    setUpdateError(null)
    setIsConfirmingDelete(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(comment.content)
    setUpdateError(null)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setUpdateError(null)

    const trimmed = editContent.trim()
    if (!trimmed) {
      setUpdateError('Comment content cannot be empty.')
      return
    }

    if (editContent.length > MAX_COMMENT_LENGTH) {
      setUpdateError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`)
      return
    }

    setIsUpdating(true)
    try {
      await onUpdateComment(comment.id, { content: trimmed })
      setIsEditing(false)
    } catch (err) {
      setUpdateError(
        err?.message || 'Failed to update comment. Please try again.',
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConfirmDelete = async () => {
    setDeleteError(null)
    setIsDeleting(true)
    try {
      await onDeleteComment(comment.id)
    } catch (err) {
      setDeleteError(
        err?.message || 'Failed to delete comment. Please try again.',
      )
      setIsDeleting(false)
      setIsConfirmingDelete(false)
    }
  }

  const authorName = comment.author?.username || 'Anonymous'
  const createdTime = comment.created_at ? new Date(comment.created_at).getTime() : 0
  const updatedTime = comment.updated_at ? new Date(comment.updated_at).getTime() : 0
  const isUpdated =
    createdTime > 0 && updatedTime > 0 && updatedTime - createdTime >= 1000
  const remainingChars = MAX_COMMENT_LENGTH - editContent.length

  return (
    <div
      className="py-4 border-b border-slate-200 last:border-b-0"
      data-testid={`comment-item-${comment.id}`}
    >
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <div className="flex items-center gap-x-2">
          <span className="font-semibold text-slate-900">{authorName}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={comment.created_at}>
            {formatPostDate(comment.created_at)}
          </time>
          {isUpdated ? (
            <span className="text-slate-400 italic">(edited)</span>
          ) : null}
        </div>

        {isOwner && !isEditing && !isConfirmingDelete ? (
          <div className="flex items-center gap-x-3">
            <button
              type="button"
              onClick={handleStartEdit}
              disabled={isDeleting}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isDeleting}
              className="font-medium text-red-600 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {deleteError ? (
        <div
          role="alert"
          className="mb-3 rounded-md bg-red-50 p-2.5 text-xs text-red-700"
        >
          {deleteError}
        </div>
      ) : null}

      {isConfirmingDelete ? (
        <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs border border-amber-200">
          <p className="font-semibold text-amber-900">
            Are you sure you want to delete this comment?
          </p>
          <div className="mt-2 flex items-center gap-x-3">
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
              className="rounded bg-white px-3 py-1.5 font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSaveEdit} className="mt-2 space-y-3">
          <div>
            <textarea
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={isUpdating}
              aria-label="Edit comment"
              className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <div className="mt-1 flex justify-end">
              <span
                className={`text-xs ${
                  remainingChars < 0
                    ? 'text-red-600 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                {remainingChars} chars remaining
              </span>
            </div>
          </div>

          {updateError ? (
            <p role="alert" className="text-xs text-red-600">
              {updateError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-x-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !editContent.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-sm leading-6 text-slate-700 whitespace-pre-wrap break-words">
          {comment.content}
        </div>
      )}
    </div>
  )
}
