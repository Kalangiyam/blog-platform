import { useState } from 'react'
import { useTaxonomies } from '../hooks/useTaxonomies.js'
import { validatePostForm } from '../utils/postValidation.js'
import CategoryTagPicker from './CategoryTagPicker.jsx'
import FeaturedImageUploader from './FeaturedImageUploader.jsx'
import PostDeleteControl from './PostDeleteControl.jsx'
import PostPublishControl from './PostPublishControl.jsx'
import PostStatusBadge from './PostStatusBadge.jsx'

export default function PostForm({
  initialData = {},
  isEditMode = false,
  onSubmit,
  onUploadFeaturedImage,
  onRemoveFeaturedImage,
  onPublish,
  onUnpublish,
  onDelete,
  isSubmitting = false,
  error = null,
}) {
  const { categories, tags } = useTaxonomies()

  const [title, setTitle] = useState(initialData.title || '')
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '')
  const [content, setContent] = useState(initialData.content || '')
  const [selectedCategories, setSelectedCategories] = useState(
    Array.isArray(initialData.category_slugs)
      ? initialData.category_slugs
      : Array.isArray(initialData.categories)
      ? initialData.categories.map((c) => (typeof c === 'string' ? c : c.slug))
      : [],
  )
  const [selectedTags, setSelectedTags] = useState(
    Array.isArray(initialData.tag_slugs)
      ? initialData.tag_slugs
      : Array.isArray(initialData.tags)
      ? initialData.tags.map((t) => (typeof t === 'string' ? t : t.slug))
      : [],
  )

  const [validationErrors, setValidationErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationErrors({})

    const formData = {
      title,
      excerpt,
      content,
      category_slugs: selectedCategories,
      tag_slugs: selectedTags,
    }

    const { isValid, errors } = validatePostForm(formData)

    if (!isValid) {
      setValidationErrors(errors)
      return
    }

    if (onSubmit) {
      await onSubmit(formData)
    }
  }

  const combinedFieldErrors = {
    ...validationErrors,
    ...(error?.fieldErrors || {}),
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Top Banner Error */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          <p className="font-semibold">{error.message || 'An error occurred.'}</p>
          {error.detail && <p className="text-xs mt-1 text-rose-400">{error.detail}</p>}
        </div>
      )}

      {/* Header Bar in Edit Mode */}
      {isEditMode && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Status:
            </span>
            <PostStatusBadge status={initialData.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(onPublish || onUnpublish) && (
              <PostPublishControl
                status={initialData.status}
                onPublish={onPublish}
                onUnpublish={onUnpublish}
                isSubmitting={isSubmitting}
                disabled={isSubmitting}
              />
            )}
            {onDelete && (
              <PostDeleteControl
                postTitle={initialData.title}
                onDelete={onDelete}
                isSubmitting={isSubmitting}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="post-title" className="block text-sm font-medium text-slate-200">
              Title <span className="text-rose-400">*</span>
            </label>
            <span className="text-xs text-slate-400">{title.length}/255</span>
          </div>
          <input
            type="text"
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={255}
            placeholder="Enter post title..."
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
            required
          />
          {combinedFieldErrors.title && (
            <p className="mt-1 text-xs text-rose-400">{combinedFieldErrors.title.join(' ')}</p>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="post-excerpt" className="block text-sm font-medium text-slate-200">
              Excerpt <span className="text-xs text-slate-400">(Summary for lists & search)</span>
            </label>
            <span className="text-xs text-slate-400">{excerpt.length}/500</span>
          </div>
          <textarea
            id="post-excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
            placeholder="Brief post summary..."
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors resize-y"
          />
          {combinedFieldErrors.excerpt && (
            <p className="mt-1 text-xs text-rose-400">{combinedFieldErrors.excerpt.join(' ')}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="post-content" className="block text-sm font-medium text-slate-200 mb-1">
            Content <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="post-content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            placeholder="Write full article content..."
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors resize-y font-mono text-sm leading-relaxed"
            required
          />
          {combinedFieldErrors.content && (
            <p className="mt-1 text-xs text-rose-400">{combinedFieldErrors.content.join(' ')}</p>
          )}
        </div>

        {/* Taxonomy Picker */}
        <div className="pt-2 border-t border-slate-800">
          <CategoryTagPicker
            availableCategories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            availableTags={tags}
            selectedTags={selectedTags}
            onTagChange={setSelectedTags}
            categoryErrors={combinedFieldErrors.category_slugs}
            tagErrors={combinedFieldErrors.tag_slugs}
            disabled={isSubmitting}
          />
        </div>

        {/* Featured Image Uploader (in edit mode or if handlers provided) */}
        {isEditMode && (onUploadFeaturedImage || onRemoveFeaturedImage) && (
          <div className="pt-2 border-t border-slate-800">
            <FeaturedImageUploader
              currentImageUrl={initialData.featured_image_url}
              onUpload={onUploadFeaturedImage}
              onRemove={onRemoveFeaturedImage}
              isSubmitting={isSubmitting}
              disabled={isSubmitting}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-sky-600 text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-sky-600/20"
        >
          {isSubmitting
            ? 'Saving...'
            : isEditMode
            ? 'Save Changes'
            : 'Create Draft Post'}
        </button>
      </div>
    </form>
  )
}
