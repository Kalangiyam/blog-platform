import CommentItem from './CommentItem.jsx'

export default function CommentList({
  comments,
  onUpdateComment,
  onDeleteComment,
}) {
  if (!comments || comments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        No comments yet. Be the first to share your thoughts!
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-200">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  )
}
