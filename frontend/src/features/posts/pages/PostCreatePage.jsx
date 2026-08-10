import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import PostForm from '../components/PostForm.jsx'
import { usePostMutations } from '../hooks/usePostMutations.js'

export default function PostCreatePage() {
  const navigate = useNavigate()
  const { handleCreatePost, handleUploadFeaturedImage, handlePublishPost, isSubmitting, error } = usePostMutations()
  const [successMessage, setSuccessMessage] = useState(null)

  const handleSubmit = async ({ formData, imageFile, actionIntent }) => {
    try {
      // 1. Create Draft
      const createdPost = await handleCreatePost(formData)
      const currentSlug = createdPost.slug
      let imageSuccess = true

      // 2. Upload Image if provided
      if (imageFile) {
        try {
          await handleUploadFeaturedImage(currentSlug, imageFile)
        } catch {
          imageSuccess = false
          // If image fails, navigate to edit with a warning
          navigate(`/posts/${currentSlug}/edit`, { state: { warning: 'Draft saved, but image upload failed.' } })
          return
        }
      }

      // 3. Publish if requested
      if (actionIntent === 'publish' && imageSuccess) {
        try {
          await handlePublishPost(currentSlug)
          setSuccessMessage('Post published successfully.')
          setTimeout(() => {
            navigate(`/posts/${currentSlug}`)
          }, 800)
          return
        } catch {
          navigate(`/posts/${currentSlug}/edit`, { state: { warning: 'Draft saved, but publishing failed.' } })
          return
        }
      }

      // Default Draft Success
      setSuccessMessage('Post saved as draft.')
      setTimeout(() => {
        navigate(`/posts/${currentSlug}/edit`)
      }, 800)

    } catch {
      // Error handled by hook & passed to form
    }
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
          <span className="text-slate-900 font-bold" aria-current="page">
            Create New Post
          </span>
        </nav>

        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Create New Post
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Write your article and publish it when you’re ready.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs animate-in fade-in duration-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Post Authoring Form */}
        <div>
          <PostForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/posts')}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
