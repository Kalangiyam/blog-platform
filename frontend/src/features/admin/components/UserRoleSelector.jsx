import { ROLE_METADATA } from '../constants/roleMetadata.js'

/**
 * Accessible presentational role selector fieldset rendering selectable card rows.
 *
 * @param {Object} props
 * @param {Array<string>} [props.selectedRoles=[]]
 * @param {Function} props.onRoleToggle
 * @param {string|string[]} [props.error=null]
 * @param {boolean} [props.disabled=false]
 */
export default function UserRoleSelector({
  selectedRoles = [],
  onRoleToggle,
  error = null,
  disabled = false,
}) {
  const hasError = Boolean(error)
  const errorMessage = Array.isArray(error) ? error.join(' ') : error

  return (
    <fieldset className="border-t border-slate-100 pt-8">
      {/* Section Header */}
      <div className="flex items-start gap-3.5 mb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {/* Shield Icon */}
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <legend className="text-base font-bold text-slate-900">
            Initial Application Roles
          </legend>
          <p className="mt-0.5 text-xs text-slate-500">
            Select one or more application roles for this user.
          </p>
        </div>
      </div>

      {/* Selectable Role Card Rows */}
      <div className="space-y-3">
        {ROLE_METADATA.map((meta) => {
          const isSelected = selectedRoles.includes(meta.role)

          return (
            <label
              className={`flex items-start gap-4 rounded-xl border p-4 transition-all cursor-pointer ${
                isSelected
                  ? `${meta.selectedBorder} ring-1 ring-indigo-500/30`
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              key={meta.role}
            >
              <div className="flex h-6 items-center pt-0.5">
                <input
                  checked={isSelected}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-0 disabled:cursor-not-allowed"
                  disabled={disabled}
                  onChange={() => onRoleToggle(meta.role)}
                  type="checkbox"
                />
              </div>

              {/* Icon Badge */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${meta.badgeColor}`}
              >
                {meta.role === 'Author' ? (
                  /* Pen / Feather Icon */
                  <svg
                    aria-hidden="true"
                    className="h-4.5 w-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : meta.role === 'Editor' ? (
                  /* Shield Check Icon */
                  <svg
                    aria-hidden="true"
                    className="h-4.5 w-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  /* Crown / Admin Icon */
                  <svg
                    aria-hidden="true"
                    className="h-4.5 w-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1">
                <span className="block text-sm font-bold text-slate-900">
                  {meta.label}
                </span>
                <span className="block mt-0.5 text-xs text-slate-500 leading-relaxed">
                  {meta.description}
                </span>
              </div>
            </label>
          )
        })}
      </div>

      {hasError ? (
        <p className="mt-2 text-xs font-medium text-red-600">{errorMessage}</p>
      ) : null}

      {/* Informational Banner */}
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs font-medium text-indigo-900">
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-indigo-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Users may hold zero, one, or multiple roles based on their responsibilities.</span>
      </div>
    </fieldset>
  )
}
