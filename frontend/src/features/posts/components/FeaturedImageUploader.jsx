import { useState, useEffect } from 'react'

export default function FeaturedImageUploader({
  currentImageUrl = null,
  selectedFile = null,
  onFileSelect,
  onUpload,
  onRemove,
  isSubmitting = false,
  disabled = false,
  mode = 'edit', // 'create' or 'edit'
}) {
  const [localError, setLocalError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  const validateAndSelectFile = (file) => {
    setLocalError(null)
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setLocalError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Image file size cannot exceed 5MB.')
      return
    }

    if (onFileSelect) {
      onFileSelect(file)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    validateAndSelectFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isSubmitting) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled || isSubmitting) return

    const file = e.dataTransfer.files?.[0]
    validateAndSelectFile(file)
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile || !onUpload) return
    setLocalError(null)
    try {
      await onUpload(selectedFile)
      if (onFileSelect) onFileSelect(null)
    } catch (err) {
      setLocalError(err.message || 'Image upload failed.')
    }
  }

  const handleRemoveSubmit = async () => {
    if (!onRemove) return
    setLocalError(null)
    try {
      await onRemove()
      if (onFileSelect) onFileSelect(null)
    } catch (err) {
      setLocalError(err.message || 'Image removal failed.')
    }
  }

  const handleClearSelection = () => {
    if (onFileSelect) onFileSelect(null)
    setLocalError(null)
  }

  const displayImage = previewUrl || currentImageUrl

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-0.5">
          Featured Image
        </h3>
        <p className="text-xs text-slate-500">
          Upload an eye-catching image to represent your post.
        </p>
      </div>

      {displayImage ? (
        <div className="space-y-3">
          <div className="relative group rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 aspect-video max-h-56 flex items-center justify-center shadow-xs">
            <img
              src={displayImage}
              alt="Featured post preview"
              className="w-full h-full object-cover"
            />
          </div>

          {selectedFile && (
            <p className="text-xs text-slate-600 font-medium truncate">
              Selected: <span className="font-semibold text-slate-900">{selectedFile.name}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <input
              type="file"
              id="featured-image-replace"
              accept="image/jpeg,image/png,image/webp"
              disabled={disabled || isSubmitting}
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor="featured-image-replace"
              className={`px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors ${
                disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {selectedFile ? 'Choose Different File' : 'Replace Image'}
            </label>

            {selectedFile && mode === 'edit' && onUpload && (
              <button
                type="button"
                disabled={disabled || isSubmitting}
                onClick={handleUploadSubmit}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Now'}
              </button>
            )}

            {selectedFile && (
              <button
                type="button"
                disabled={disabled || isSubmitting}
                onClick={handleClearSelection}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Clear Selection
              </button>
            )}

            {currentImageUrl && !selectedFile && mode === 'edit' && onRemove && (
              <button
                type="button"
                disabled={disabled || isSubmitting}
                onClick={handleRemoveSubmit}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Removing...' : 'Remove Image'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all flex flex-col items-center justify-center relative ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            {/* Cloud Icon */}
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 shadow-2xs">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.75 3.75 0 0118 19.5H6.75z" />
              </svg>
            </div>

            <p className="text-xs font-semibold text-slate-800 mb-1">
              Drag and drop an image here, or click to browse
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              PNG, JPG or WEBP up to 5 MB.
            </p>

            <input
              aria-label="Choose featured image"
              type="file"
              id="featured-image-input"
              accept="image/jpeg,image/png,image/webp"
              disabled={disabled || isSubmitting}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            <button
              aria-hidden="true"
              tabIndex={-1}
              type="button"
              disabled={disabled || isSubmitting}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors pointer-events-none"
            >
              Choose File
            </button>
          </div>

          <div className="pt-1 text-left">
            <p className="text-xs font-bold text-slate-800">No image selected</p>
            <p className="text-xs text-slate-500">Your post will be displayed without a featured image.</p>
          </div>
        </div>
      )}

      {localError && (
        <p className="text-xs font-medium text-rose-500 mt-2">{localError}</p>
      )}
    </div>
  )
}
