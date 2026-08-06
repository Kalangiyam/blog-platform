import { useFeaturedImageUpload } from '../hooks/useFeaturedImageUpload.js'
import FeaturedImagePreview from './FeaturedImagePreview.jsx'
import ImageDropZone from './ImageDropZone.jsx'
import RemoveImageButton from './RemoveImageButton.jsx'
import UploadError from './UploadError.jsx'
import UploadProgress from './UploadProgress.jsx'

export default function FeaturedImageUploader({
  postSlug,
  initialImageUrl = null,
  onUploadSuccess,
  onRemoveSuccess,
  className = '',
}) {
  const {
    progress,
    selectedFile,
    previewUrl,
    isLocalPreview,
    error,
    isUploading,
    isRemoving,
    selectFile,
    clearSelection,
    upload,
    remove,
    cancel,
    hasImage,
  } = useFeaturedImageUpload({
    initialImageUrl,
    postSlug,
    onUploadSuccess,
    onRemoveSuccess,
  })

  return (
    <div className={`space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">
            Post Featured Image
          </h3>
          <p className="text-xs text-slate-500">
            Upload a high-resolution hero image for your blog post.
          </p>
        </div>

        {hasImage && (
          <RemoveImageButton
            disabled={isUploading || isRemoving}
            isRemoving={isRemoving}
            onRemove={remove}
          />
        )}
      </div>

      {/* Error alert */}
      <UploadError
        error={error}
        onDismiss={clearSelection}
        onRetry={selectedFile ? upload : remove}
      />

      {/* Upload Progress */}
      <UploadProgress
        isUploading={isUploading}
        onCancel={cancel}
        progress={progress}
      />

      {/* Preview */}
      {previewUrl && (
        <FeaturedImagePreview
          isLoading={isUploading || isRemoving}
          isLocalPreview={isLocalPreview}
          url={previewUrl}
        />
      )}

      {/* Action controls when a local file is drafted */}
      {selectedFile && isLocalPreview && !isUploading && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
          <div className="text-xs text-slate-700">
            <span className="font-semibold text-slate-900">{selectedFile.name}</span>
            <span className="ml-2 text-slate-500">
              ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={clearSelection}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={upload}
              type="button"
            >
              Upload Image
            </button>
          </div>
        </div>
      )}

      {/* Drop zone for selecting or replacing */}
      {!isUploading && !isRemoving && (
        <ImageDropZone
          disabled={isUploading || isRemoving}
          hasImage={hasImage}
          onFileSelect={selectFile}
        />
      )}
    </div>
  )
}
