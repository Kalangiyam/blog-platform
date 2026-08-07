import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import PostForm from '../components/PostForm.jsx'
import { usePostMutations } from '../hooks/usePostMutations.js'

export default function PostCreatePage() {
  const navigate = useNavigate()
  const { handleCreatePost, isSubmitting, error } = usePostMutations()
  const [successMessage, setSuccessMessage] = useState(null)

  const handleSubmit = async (formData) => {
    try {
      const createdPost = await handleCreatePost(formData)
      setSuccessMessage('Post created successfully as draft.')
      setTimeout(() => {
        if (createdPost?.slug) {
          navigate(`/posts/${createdPost.slug}`)
        } else {
          navigate('/posts')
        }
      }, 1000)
    } catch {
      // Error handled by hook & passed to form
    }
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
        <span className="text-slate-200 font-medium" aria-current="page">
          Create Post
        </span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Create New Post
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Draft a new blog post, assign categories and tags, and prepare it for publication.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold">
          {successMessage}
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl backdrop-blur-sm">
        <PostForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    </div>
  )
}
