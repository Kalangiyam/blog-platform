import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import {
  createPostComment,
  deleteComment,
  getPostComments,
  updateComment,
} from '../api/commentsApi.js'
import CommentCreateForm from './CommentCreateForm.jsx'
import CommentList from './CommentList.jsx'
import CommentPagination from './CommentPagination.jsx'
import CommentRequestError from './CommentRequestError.jsx'
import { COMMENT_ERROR_CODES } from '../utils/commentErrors.js'
import {
  buildCommentsSearch,
  isCanonicalCommentsSearch,
  parseCommentsPage,
} from '../utils/commentPagination.js'

export default function CommentsSection({ postSlug }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = parseCommentsPage(searchParams)

  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState({
    requestKey: null,
    status: 'loading',
    comments: [],
    count: 0,
    next: null,
    previous: null,
    error: null,
  })

  const requestKey = `${postSlug}:${currentPage}:${retryKey}`
  const status = state.requestKey === requestKey ? state.status : 'loading'

  // URL Canonicalization effect
  useEffect(() => {
    if (!isCanonicalCommentsSearch(searchParams)) {
      const canonicalSearch = buildCommentsSearch(searchParams, currentPage)
      setSearchParams(new URLSearchParams(canonicalSearch), { replace: true })
    }
  }, [searchParams, currentPage, setSearchParams])

  // Fetch comments effect
  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function fetchComments() {
      try {
        const data = await getPostComments(postSlug, currentPage, {
          signal: controller.signal,
        })

        if (active) {
          setState({
            requestKey,
            status: 'success',
            comments: data.results || [],
            count: data.count || 0,
            next: data.next,
            previous: data.previous,
            error: null,
          })
        }
      } catch (err) {
        if (active && err.code !== COMMENT_ERROR_CODES.CANCELLED) {
          setState({
            requestKey,
            status: 'error',
            comments: [],
            count: 0,
            next: null,
            previous: null,
            error: err,
          })
        }
      }
    }

    fetchComments()

    return () => {
      active = false
      controller.abort()
    }
  }, [postSlug, currentPage, requestKey])

  const handleCreateComment = async (payload) => {
    const newComment = await createPostComment(postSlug, payload)
    setState((prev) => {
      const newCount = prev.count + 1
      if (currentPage === 1 && prev.comments.length < 20) {
        return {
          ...prev,
          comments: [...prev.comments, newComment],
          count: newCount,
        }
      }
      return {
        ...prev,
        count: newCount,
      }
    })
    return newComment
  }

  const handleUpdateComment = async (commentId, payload) => {
    const updated = await updateComment(commentId, payload)
    setState((prev) => ({
      ...prev,
      comments: prev.comments.map((item) =>
        item.id === commentId ? updated : item,
      ),
    }))
    return updated
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId)
    setState((prev) => {
      const remaining = prev.comments.filter((item) => item.id !== commentId)
      const newCount = Math.max(0, prev.count - 1)

      if (remaining.length === 0 && currentPage > 1) {
        const canonicalSearch = buildCommentsSearch(
          searchParams,
          currentPage - 1,
        )
        setSearchParams(new URLSearchParams(canonicalSearch))
      }

      return {
        ...prev,
        comments: remaining,
        count: newCount,
      }
    })
  }

  return (
    <section
      className="mt-12 border-t border-slate-200 pt-8"
      aria-label="Comments"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Comments ({status === 'success' ? state.count : '...'})
        </h2>
      </div>

      <div className="mb-8">
        <CommentCreateForm onSubmitComment={handleCreateComment} />
      </div>

      {status === 'loading' ? (
        <div
          role="status"
          aria-live="polite"
          className="py-8 text-center text-sm text-slate-500"
        >
          Loading comments...
        </div>
      ) : status === 'error' ? (
        <CommentRequestError
          error={state.error}
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      ) : (
        <>
          <CommentList
            comments={state.comments}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />
          <CommentPagination
            count={state.count}
            currentPage={currentPage}
            pageSize={20}
            searchParams={searchParams}
          />
        </>
      )}
    </section>
  )
}
