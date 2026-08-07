/**
 * Accessible badge component displaying account active/inactive status.
 * Uses explicit text and accessible color contrast.
 *
 * @param {Object} props
 * @param {boolean} props.isActive
 */
export default function UserStatusBadge({ isActive }) {
  if (isActive) {
    return (
      <span
        aria-label="Account status: Active"
        className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200"
      >
        Active
      </span>
    )
  }

  return (
    <span
      aria-label="Account status: Inactive"
      className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200"
    >
      Inactive
    </span>
  )
}
