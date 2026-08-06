import { getProfileInitials } from '../utils/profileInitials.js'

const SIZE_CLASSES = Object.freeze({
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl font-bold',
  xl: 'h-28 w-28 text-3xl font-extrabold',
})

/**
 * Deterministic initials-based visual placeholder component for user profiles.
 * Used in place of non-existent avatar image upload endpoints.
 *
 * @param {{ username?: string, name?: string, size?: 'sm'|'md'|'lg'|'xl', className?: string }} props
 */
export default function ProfileAvatarPlaceholder({
  username,
  name,
  size = 'lg',
  className = '',
}) {
  const initials = getProfileInitials(name || username)
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.lg

  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm ring-4 ring-white ${sizeClass} ${className}`}
    >
      <span>{initials}</span>
    </div>
  )
}
