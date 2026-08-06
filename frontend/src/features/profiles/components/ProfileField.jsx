/**
 * Displays a labeled profile detail field.
 *
 * @param {{ label: string, value?: React.ReactNode, children?: React.ReactNode, icon?: React.ReactNode, className?: string }} props
 */
export default function ProfileField({ label, value, children, icon, className = '' }) {
  const content = children ?? value

  if (!content) {
    return null
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <span>{label}</span>
      </dt>
      <dd className="text-base text-slate-800">{content}</dd>
    </div>
  )
}
