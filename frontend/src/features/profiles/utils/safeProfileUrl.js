/**
 * Validates whether a raw URL string is a safe HTTP or HTTPS URL.
 *
 * @param {string} [rawUrl]
 * @returns {string|null} The normalized safe URL string or null if unsafe/invalid.
 */
export function getSafeProfileUrl(rawUrl) {
  if (typeof rawUrl !== 'string') {
    return null
  }

  const trimmed = rawUrl.trim()

  if (!trimmed) {
    return null
  }

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()

    if (protocol !== 'http:' && protocol !== 'https:') {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Returns true if the raw URL string is a safe HTTP or HTTPS URL.
 *
 * @param {string} [rawUrl]
 * @returns {boolean}
 */
export function isSafeProfileUrl(rawUrl) {
  return getSafeProfileUrl(rawUrl) !== null
}
