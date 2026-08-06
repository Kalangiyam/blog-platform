import { useRef, useState } from 'react'

export default function ImageDropZone({
  onFileSelect,
  disabled = false,
  hasImage = false,
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
    // reset input value so selecting the same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      triggerSelect()
    }
  }

  return (
    <div
      aria-label="Upload featured image"
      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${
        isDragOver
          ? 'border-indigo-600 bg-indigo-50/50'
          : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
      } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      onClick={triggerSelect}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      <input
        accept="image/jpeg,image/png,image/webp"
        aria-hidden="true"
        className="sr-only"
        disabled={disabled}
        onChange={handleInputChange}
        ref={fileInputRef}
        type="file"
      />

      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 group-hover:scale-105 transition-transform duration-200">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
          />
        </svg>
      </div>

      <div className="mt-4">
        <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
          {hasImage ? 'Click or drag to replace image' : 'Click or drag image to upload'}
        </span>
        <p className="mt-1 text-xs text-slate-500">
          Supports JPEG, PNG, and WebP (up to 5 MB)
        </p>
      </div>
    </div>
  )
}
