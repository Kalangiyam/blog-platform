import { useState } from 'react'
import { useTaxonomyManagement } from '../hooks/useTaxonomyManagement.js'
import TaxonomyTable from '../components/TaxonomyTable.jsx'
import TaxonomyFormModal from '../components/TaxonomyFormModal.jsx'

export default function TagManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    data,
    isLoading,
    error,
    page,
    isSubmitting,
    editingItem,
    setPage,
    setEditingItem,
    handleSave,
    handleToggleActive,
    retry,
  } = useTaxonomyManagement('tag')

  const handleOpenCreate = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleFormSave = async (formData) => {
    await handleSave(formData)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tag Management</h2>
          <p className="text-xs text-slate-500">Create, edit, activate, or deactivate blog post tags.</p>
        </div>

        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleOpenCreate}
          type="button"
        >
          + Create Tag
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">{error.message || 'Failed to load tags.'}</p>
          <button
            className="mt-2 text-xs font-semibold text-rose-800 underline hover:text-rose-900"
            onClick={retry}
            type="button"
          >
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div aria-label="Loading tags" className="p-12 text-center text-slate-500" role="status">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="mt-2 text-sm">Loading tags...</p>
        </div>
      ) : (
        <>
          <TaxonomyTable
            isSubmitting={isSubmitting}
            items={data?.results || []}
            onEdit={handleOpenEdit}
            onToggleActive={handleToggleActive}
            type="tag"
          />

          {data && data.count > 0 ? (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
              <span className="text-slate-500">Total: {data.count} tags</span>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={!data.previous}
                  onClick={() => setPage(page - 1)}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  disabled={!data.next}
                  onClick={() => setPage(page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <TaxonomyFormModal
        error={error}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        item={editingItem}
        onClose={handleCloseModal}
        onSave={handleFormSave}
        type="tag"
      />
    </div>
  )
}
