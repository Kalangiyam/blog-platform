/**
 * Informational 4-level password strength indicator with segmented bar display.
 *
 * @param {Object} props
 * @param {string} [props.password='']
 */
export default function PasswordStrengthIndicator({ password = '' }) {
  const { score, label, colorClass, barColors } = getStrengthMetrics(password)

  return (
    <div
      aria-label={`Password strength: ${label}`}
      className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600"
      role="status"
    >
      <span>
        Password strength:{' '}
        <span className={`font-semibold ${colorClass}`}>{label}</span>
      </span>

      {/* 4 Segmented Bar Pills */}
      <div aria-hidden="true" className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((index) => {
          const isFilled = index < score
          const segmentColor = isFilled ? barColors : 'bg-slate-200'

          return (
            <div
              className={`h-1.5 w-7 rounded-full transition-colors duration-200 ${segmentColor}`}
              key={index}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * Lightweight heuristic evaluating length and character diversity.
 * Returns score (0-4), label, text color class, and bar fill class.
 */
function getStrengthMetrics(password) {
  if (!password) {
    return {
      score: 0,
      label: 'Weak',
      colorClass: 'text-slate-400',
      barColors: 'bg-slate-200',
    }
  }

  const length = password.length
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)

  const varietyCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length

  if (length >= 12 && varietyCount >= 4) {
    return {
      score: 4,
      label: 'Strong',
      colorClass: 'text-emerald-600',
      barColors: 'bg-emerald-500',
    }
  }

  if (length >= 10 && varietyCount >= 3) {
    return {
      score: 3,
      label: 'Good',
      colorClass: 'text-blue-600',
      barColors: 'bg-blue-500',
    }
  }

  if (length >= 8 && varietyCount >= 2) {
    return {
      score: 2,
      label: 'Fair',
      colorClass: 'text-amber-600',
      barColors: 'bg-amber-500',
    }
  }

  return {
    score: 1,
    label: 'Weak',
    colorClass: 'text-red-600',
    barColors: 'bg-red-500',
  }
}
