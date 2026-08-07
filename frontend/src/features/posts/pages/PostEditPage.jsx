import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getPublishedPost, updatePost } from '../api/postsApi.js'
import PostForm from '../components/PostForm.jsx'
import { usePostMutations } from '../hooks/usePostMutations.js'

export default function PostEditPage() {
  const { postSlug } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

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

  const handleSubmit = async (formData) => {
    setSuccessMessage(null)
    try {
      const updated = await handleUpdatePost(postSlug, formData)
      setPost(updated)
      setSuccessMessage('Post updated successfully.')
      // If slug changed on update, navigate to new URL
      if (updated?.slug && updated.slug !== postSlug) {
        navigate(`/posts/${updated.slug}/edit`, { replace: true })
      }
    } catch {
      // Mutation error handled by hook & passed to form
    }
  }

  const handlePublish = async () => {
    setSuccessMessage(null)
    try {
      const updated = await handlePublishPost(postSlug)
      setPost(updated)
      setSuccessMessage('Post published successfully!')
    } catch {
      // Handled by hook
    }
  }

  const handleUnpublish = async () => {
    setSuccessMessage(null)
    try {
      const updated = await handleUnpublishPost(postSlug)
      setPost(updated)
      setSuccessMessage('Post unpublished (moved to draft).')
    } catch {
      // Handled by hook
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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <p className="text-sm animate-pulse">Loading post editor...</p>
      </div>
    )
  }

  if (fetchError || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
          <h2 className="text-lg font-bold">Unable to edit post</h2>
          <p className="text-sm mt-1">
            {fetchError?.message || 'The post was not found or you do not have permission to edit it.'}
          </p>
        </div>
        <Link
          to="/posts"
          className="inline-block px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
        >
          Return to Posts
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center space-x-2">
        <Link to="/" className="hover:text-slate-200 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/posts" className="hover:text-slate-200 transition-colors">
          Posts
        </Link>
        <span>/</span>
        <Link to={`/posts/${post.slug}`} className="hover:text-slate-200 transition-colors truncate max-w-xs">
          {post.title}
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-medium" aria-current="page">
          Edit
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Edit Post
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Update content, taxonomy, featured image, or workflow status for &ldquo;{post.title}&rdquo;.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
          {successMessage}
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl backdrop-blur-sm">
        <PostForm
          initialData={post}
          isEditMode={true}
          onSubmit={handleSubmit}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDelete={handleDelete}
          onUploadFeaturedImage={handleUploadImage}
          onRemoveFeaturedImage={handleRemoveImage}
          isSubmitting={isSubmitting}
          error={mutationError}
        />
      </div>
    </div>
  )
}
