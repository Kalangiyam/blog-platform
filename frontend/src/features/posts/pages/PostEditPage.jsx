import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router'
import { getPublishedPost, updatePost } from '../api/postsApi.js'
import PostForm from '../components/PostForm.jsx'
import { usePostMutations } from '../hooks/usePostMutations.js'

export default function PostEditPage() {
  const { postSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [warningMessage, setWarningMessage] = useState(location.state?.warning || null)

  const {
    handleUpdatePost,
    handlePublishPost,
    handleUnpublishPost,
    handleDeletePost,
    handleUploadFeaturedImage,
    handleRemoveFeaturedImage,
    isSubmitting,
    error: mutationError,
  } = usePostMutations()

  // Clear warning when it changes via location or when starting a new action
  useEffect(() => {
    if (location.state?.warning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWarningMessage(location.state.warning)
      // Clean up state so refresh doesn't show it again
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    const controller = new AbortController()
    let isSubscribed = true

    async function loadPost() {
      try {
        setLoading(true)
        setFetchError(null)

        let postData
        try {
          postData = await getPublishedPost(postSlug, { signal: controller.signal })
        } catch {
          // If 404 on published, try management fetch (PATCH {}) for draft posts
          postData = await updatePost(postSlug, {}, { signal: controller.signal })
        }

        if (isSubscribed) {
          setPost(postData)
        }
      } catch (err) {
        if (isSubscribed && err?.code !== 'cancelled') {
          setFetchError(err)
        }
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    if (postSlug) {
      loadPost()
    }

    return () => {
      isSubscribed = false
      controller.abort()
    }
  }, [postSlug])

  const handleSubmit = async ({ formData, imageFile, actionIntent }) => {
    setSuccessMessage(null)
    setWarningMessage(null)

    let updatedSlug = postSlug
    let hasWarning = false

    // 1. Handle Update / Save Draft
    if (actionIntent === 'update' || actionIntent === 'save_draft') {
      try {
        const updated = await handleUpdatePost(postSlug, formData)
        updatedSlug = updated.slug
        setPost(updated)
      } catch {
        return // handled by hook
      }

      // 2. Upload pending image if user selected but didn't click "Upload Now"
      if (imageFile) {
        try {
          const res = await handleUploadFeaturedImage(updatedSlug, imageFile)
          setPost(prev => ({ ...prev, featured_image_url: res.featured_image_url }))
        } catch {
          hasWarning = true
          setWarningMessage('Post updated, but featured image upload failed.')
        }
      }

      if (!hasWarning) {
        setSuccessMessage('Post updated successfully.')
      }

      if (updatedSlug !== postSlug) {
        navigate(`/posts/${updatedSlug}/edit`, { replace: true })
      }
    }

    // 3. Handle Publish
    if (actionIntent === 'publish') {
       try {
          // ensure we update first
          const updated = await handleUpdatePost(postSlug, formData)
          updatedSlug = updated.slug
          setPost(updated)

          if (imageFile) {
            try {
              const res = await handleUploadFeaturedImage(updatedSlug, imageFile)
              setPost(prev => ({ ...prev, featured_image_url: res.featured_image_url }))
            } catch {
               hasWarning = true
               setWarningMessage('Post updated, but image upload failed before publishing.')
            }
          }

          if (!hasWarning) {
            const pub = await handlePublishPost(updatedSlug)
            setPost(pub)
            setSuccessMessage('Post published successfully!')
          }
       } catch {
         // hook error
       }
       if (updatedSlug !== postSlug) {
          navigate(`/posts/${updatedSlug}/edit`, { replace: true })
       }
    }

    // 4. Handle Unpublish
    if (actionIntent === 'unpublish') {
      try {
        const updated = await handleUpdatePost(postSlug, formData)
        updatedSlug = updated.slug
        const unpub = await handleUnpublishPost(updatedSlug)
        setPost(unpub)
        setSuccessMessage('Post unpublished (moved to draft).')
      } catch {
         // hook error
      }
      if (updatedSlug !== postSlug) {
         navigate(`/posts/${updatedSlug}/edit`, { replace: true })
      }
    }
  }

  const handleDelete = async () => {
    try {
      await handleDeletePost(postSlug)
      navigate('/posts')
    } catch {
      // Handled by hook
    }
  }

  const handleUploadImage = async (file) => {
    setSuccessMessage(null)
    setWarningMessage(null)
    try {
      const result = await handleUploadFeaturedImage(postSlug, file)
      setPost((prev) => (prev ? { ...prev, featured_image_url: result.featured_image_url } : prev))
      setSuccessMessage('Featured image uploaded successfully.')
    } catch {
      // Handled by hook
    }
  }

  const handleRemoveImage = async () => {
    setSuccessMessage(null)
    setWarningMessage(null)
    try {
      await handleRemoveFeaturedImage(postSlug)
      setPost((prev) => (prev ? { ...prev, featured_image_url: null } : prev))
      setSuccessMessage('Featured image removed.')
    } catch {
      // Handled by hook
    }
  }

  if (loading) {
    return (
      <div className="w-full bg-slate-50/60 min-h-screen py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-slate-500">
          <p className="text-xs font-semibold animate-pulse">Loading post editor...</p>
        </div>
      </div>
    )
  }

  if (fetchError || !post) {
    return (
      <div className="w-full bg-slate-50/60 min-h-screen py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs shadow-2xs">
            <h2 className="font-bold">Unable to edit post</h2>
            <p className="mt-1 font-medium text-rose-600">
              {fetchError?.message || 'The post was not found or you do not have permission to edit it.'}
            </p>
          </div>
          <Link
            to="/posts"
            className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs"
          >
            Return to Posts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-50/60 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs font-medium text-slate-500 flex items-center space-x-2">
          <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300 font-normal">&gt;</span>
          <Link to="/posts" className="hover:text-indigo-600 transition-colors">
            Posts
          </Link>
          <span className="text-slate-300 font-normal">&gt;</span>
          <Link to={`/posts/${post.slug}`} className="hover:text-indigo-600 transition-colors truncate max-w-[200px]">
            {post.title}
          </Link>
          <span className="text-slate-300 font-normal">&gt;</span>
          <span className="text-slate-900 font-bold" aria-current="page">
            Edit
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
              Edit Post
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Update your post content and settings.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <Link
                to={`/posts/${post.slug}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </Link>
          </div>
        </div>

        {warningMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-2xs flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{warningMessage}</span>
          </div>
        )}

        {successMessage && !warningMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <div>
          <PostForm
            initialData={post}
            isEditMode={true}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/posts')}
            onDelete={handleDelete}
            onUploadFeaturedImage={handleUploadImage}
            onRemoveFeaturedImage={handleRemoveImage}
            isSubmitting={isSubmitting}
            error={mutationError}
          />
        </div>
      </div>
    </div>
  )
}
