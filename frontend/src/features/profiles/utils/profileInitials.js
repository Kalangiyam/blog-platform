/**
 * Extract 1-2 clean uppercase initials from a username, display name, or full name.
 *
 * @param {string} [nameOrUsername]
 * @returns {string}
 */
export function getProfileInitials(nameOrUsername) {
  if (typeof nameOrUsername !== 'string') {
    return '?'
  }

  const trimmed = nameOrUsername.trim()

  if (!trimmed) {
    return '?'
  }

  // Split by spaces, underscores, or hyphens
  const parts = trimmed.split(/[\s_-]+/).filter(Boolean)

  if (parts.length === 0) {
    return '?'
  }

  if (parts.length === 1) {
    // Single word: take first char or first 2 chars if uppercase
    const singleWord = parts[0]
    return singleWord.slice(0, 1).toUpperCase()
  }

  // Multiple parts: take first char of first and last parts
  const firstInitial = parts[0].slice(0, 1)
  const lastInitial = parts[parts.length - 1].slice(0, 1)

  return `${firstInitial}${lastInitial}`.toUpperCase()
}
