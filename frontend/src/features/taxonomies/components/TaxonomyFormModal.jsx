import { useState } from 'react'

export default function TaxonomyFormModal({
  isOpen,
  type,
  item,
  isSubmitting,
  error,
  onClose,
  onSave,
}) {
  const [prevItem, setPrevItem] = useState(item)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [name, setName] = useState(item?.name || '')
  const [isActive, setIsActive] = useState(item ? Boolean(item.is_active) : true)

  if (item !== prevItem || isOpen !== prevIsOpen) {
    setPrevItem(item)
    setPrevIsOpen(isOpen)
    setName(item?.name || '')
    setIsActive(item ? Boolean(item.is_active) : true)
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await onSave({ name: name.trim(), is_active: isActive })
    } catch {
      // Handled by parent hook error state
    }
  }

  const title = item
    ? `Edit ${type === 'category' ? 'Category' : 'Tag'}`
    : `Create New ${type === 'category' ? 'Category' : 'Tag'}`

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900" id="modal-title">
          {title}
        </h2>

        {error ? (
          <div className="mt-3 rounded-md bg-rose-50 p-3 text-xs text-rose-700">
            {error.message || 'Failed to save.'}
          </div>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="taxonomy-name">
              Name
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none"
              id="taxonomy-name"
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type} name`}
              required
              type="text"
              value={name}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              checked={isActive}
              className="h-4 w-4 rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-500"
              id="taxonomy-is-active"
              onChange={(e) => setIsActive(e.target.checked)}
              type="checkbox"
            />
            <label className="text-sm font-medium text-slate-700" htmlFor="taxonomy-is-active">
              Active (Visible in public pickers)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-50"
              disabled={isSubmitting || !name.trim()}
              type="submit"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
