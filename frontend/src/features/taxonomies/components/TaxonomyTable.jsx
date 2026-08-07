export default function TaxonomyTable({
  items,
  type,
  isSubmitting,
  onEdit,
  onToggleActive,
}) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
        No {type === 'category' ? 'categories' : 'tags'} found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3" scope="col">Name</th>
            <th className="px-4 py-3" scope="col">Slug</th>
            <th className="px-4 py-3" scope="col">Status</th>
            <th className="px-4 py-3 text-right" scope="col">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => (
            <tr className="hover:bg-slate-50 transition" key={item.id}>
              <td className="px-4 py-3 font-semibold text-slate-900">
                {item.name}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">
                {item.slug}
              </td>
              <td className="px-4 py-3">
                {item.is_active ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    disabled={isSubmitting}
                    onClick={() => onEdit(item)}
                    type="button"
                  >
                    Edit
                  </button>

                  <button
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                      item.is_active
                        ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    disabled={isSubmitting}
                    onClick={() => onToggleActive(item)}
                    type="button"
                  >
                    {item.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
