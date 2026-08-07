import { useState } from 'react'

export default function FeaturedImageUploader({
  currentImageUrl = null,
  onUpload,
  onRemove,
  isSubmitting = false,
  disabled = false,
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [localError, setLocalError] = useState(null)

  const handleFileChange = (e) => {
    setLocalError(null)
    const file = e.target.files?.[0]
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

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile || !onUpload) return
    setLocalError(null)
    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (err) {
      setLocalError(err.message || 'Image upload failed.')
    }
  }

  const handleRemoveSubmit = async () => {
    if (!onRemove) return
    setLocalError(null)
    try {
      await onRemove()
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (err) {
      setLocalError(err.message || 'Image removal failed.')
    }
  }

  const displayImage = previewUrl || currentImageUrl

  return (
    <div className="space-y-3 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
      <label className="block text-sm font-medium text-slate-300">
        Featured Image
      </label>

      {displayImage ? (
        <div className="relative group rounded-md overflow-hidden bg-slate-950 border border-slate-800 aspect-video max-h-48 flex items-center justify-center">
          <img
            src={displayImage}
            alt="Featured post preview"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-700 rounded-md p-6 text-center hover:border-slate-600 transition-colors">
          <p className="text-xs text-slate-400">
            No featured image selected. (JPEG, PNG, WebP up to 5MB)
          </p>
        </div>
      )}

      {localError && (
        <p className="text-xs text-rose-400">{localError}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          id="featured-image-input"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || isSubmitting}
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor="featured-image-input"
          className={`px-3 py-1.5 rounded text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700 ${
            disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {displayImage ? 'Choose Different Image' : 'Select Image'}
        </label>

        {selectedFile && onUpload && (
          <button
            type="button"
            disabled={disabled || isSubmitting}
            onClick={handleUploadSubmit}
            className="px-3 py-1.5 rounded text-xs font-medium bg-sky-600 text-white hover:bg-sky-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Image'}
          </button>
        )}

        {currentImageUrl && onRemove && (
          <button
            type="button"
            disabled={disabled || isSubmitting}
            onClick={handleRemoveSubmit}
            className="px-3 py-1.5 rounded text-xs font-medium bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors border border-rose-500/30 disabled:opacity-50"
          >
            {isSubmitting ? 'Removing...' : 'Remove Image'}
          </button>
        )}
      </div>
    </div>
  )
}
