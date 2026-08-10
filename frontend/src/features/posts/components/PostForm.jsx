import { useState } from 'react'
import { useTaxonomies } from '../hooks/useTaxonomies.js'
import { validatePostForm } from '../utils/postValidation.js'
import CategoryTagPicker from './CategoryTagPicker.jsx'
import FeaturedImageUploader from './FeaturedImageUploader.jsx'

function countWords(str) {
  const trimmed = typeof str === 'string' ? str.trim() : ''
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export default function PostForm({
  initialData = {},
  isEditMode = false,
  onSubmit, // receives { formData, imageFile, actionIntent }
  onUploadFeaturedImage, // explicit upload in edit mode
  onRemoveFeaturedImage, // explicit remove in edit mode
  onDelete, // explicit delete in edit mode
  onCancel, // explicit cancel
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

  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [publishingIntent, setPublishingIntent] = useState('save_draft') // 'save_draft' | 'publish'
  const [validationErrors, setValidationErrors] = useState({})

  const handleAction = async (actionIntentOverride) => {
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

    // Intent resolution
    const intent = actionIntentOverride || publishingIntent

    if (onSubmit) {
      await onSubmit({
        formData,
        imageFile: selectedImageFile,
        actionIntent: intent, // 'save_draft', 'publish', 'unpublish', 'update'
      })
    }
  }

  const combinedFieldErrors = {
    ...validationErrors,
    ...(error?.fieldErrors || {}),
  }

  const wordCount = countWords(content)

  return (
    <div className="space-y-8">
      {/* Top Banner Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs shadow-2xs">
          <p className="font-bold">{error.message || 'An error occurred.'}</p>
          {error.detail && <p className="mt-1 text-rose-600 font-medium">{error.detail}</p>}
        </div>
      )}

      {/* 2-Column Responsive Layout (Equal 50/50 Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left Column — Basic Information Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Basic Information
            </h2>
          </div>

          {/* Title Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="post-title" className="block text-xs font-bold text-slate-800">
                Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">{title.length}/255</span>
            </div>
            <input
              type="text"
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              maxLength={255}
              placeholder="Enter an engaging title for your post"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              required
            />
            {combinedFieldErrors.title && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{combinedFieldErrors.title.join(' ')}</p>
            )}
          </div>

          {/* Excerpt Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="post-excerpt" className="block text-xs font-bold text-slate-800">
                Excerpt
              </label>
              <span className="text-[11px] text-slate-400 font-medium">{excerpt.length}/500</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-1.5">
              Write a short summary that describes your post.
            </p>
            <textarea
              id="post-excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              placeholder="Write a short excerpt..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors resize-y"
            />
            {combinedFieldErrors.excerpt && (
              <p className="mt-1.5 text-xs text-rose-500 font-medium">{combinedFieldErrors.excerpt.join(' ')}</p>
            )}
          </div>

          {/* Content Field */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="post-content" className="block text-xs font-bold text-slate-800">
              Content <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-1">
              Write the full content of your article.
            </p>

            <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
              <textarea
                id="post-content"
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                placeholder="Write your post content here..."
                className="w-full p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent resize-y font-sans leading-relaxed min-h-[380px]"
                required
              />

              {/* Bottom Word Counter */}
              <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end">
                <span className="text-[11px] font-semibold text-slate-400">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
              </div>
            </div>

            {combinedFieldErrors.content && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{combinedFieldErrors.content.join(' ')}</p>
            )}
          </div>
        </div>

        {/* Right Column — Stacked Cards */}
        <div className="space-y-6">
          {/* Featured Image Card */}
          <FeaturedImageUploader
            currentImageUrl={initialData.featured_image_url}
            selectedFile={selectedImageFile}
            onFileSelect={setSelectedImageFile}
            onUpload={isEditMode ? onUploadFeaturedImage : undefined}
            onRemove={isEditMode ? onRemoveFeaturedImage : undefined}
            isSubmitting={isSubmitting}
            disabled={isSubmitting}
            mode={isEditMode ? 'edit' : 'create'}
          />

          {/* Taxonomies (Categories & Tags Cards) */}
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

          {/* Publishing Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-0.5">
                Publishing
              </h3>
              <p className="text-xs text-slate-500">
                {isEditMode
                  ? `Current Status: ${initialData.status === 'published' ? 'Published' : 'Draft'}`
                  : 'Posts are created as drafts by default. You can publish when ready.'}
              </p>
            </div>

            {/* Status Select */}
            <div>
              <label htmlFor="publishing-status" className="block text-xs font-bold text-slate-800 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              {!isEditMode ? (
                <select
                  id="publishing-status"
                  value={publishingIntent === 'publish' ? 'Published' : 'Draft'}
                  onChange={(e) => {
                    setPublishingIntent(e.target.value === 'Published' ? 'publish' : 'save_draft')
                  }}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              ) : (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                  {initialData.status === 'published' ? 'Published' : 'Draft'}
                </div>
              )}
            </div>

            {/* Information Callout Box */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs flex items-start gap-2.5 shadow-2xs">
              <svg className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="font-medium text-[11px] leading-relaxed">
                Drafts are only visible to you and editors. Published posts are visible to everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <div className="w-full sm:w-auto flex justify-start gap-3">
          {onCancel && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          )}
          {isEditMode && onDelete && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
                  onDelete()
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              Delete Post
            </button>
          )}
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
          {/* Save as Draft / Save Changes */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleAction(isEditMode ? 'update' : 'save_draft')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save as Draft')}
          </button>

          {/* Publish Post */}
          {!isEditMode && (
            <div className="w-full sm:w-auto relative inline-flex">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAction('publish')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs shadow-indigo-600/20 disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          )}

          {isEditMode && initialData.status === 'draft' && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction('publish')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
          )}

          {isEditMode && initialData.status === 'published' && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction('unpublish')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Unpublishing...' : 'Unpublish Post'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
