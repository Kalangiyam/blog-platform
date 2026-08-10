import { getSafeProfileUrl } from './safeProfileUrl.js'

/**
 * Calculates private profile completion percentage (0-100%) based on five
 * equally weighted (20% each) public-facing fields:
 * - first_name
 * - last_name
 * - bio
 * - location
 * - website (must be valid safe URL)
 *
 * @param {{ bio?: string, location?: string, website?: string }} profile
 * @param {{ first_name?: string, last_name?: string }} [user]
 * @returns {number} Percentage between 0 and 100
 */
export function calculateProfileCompletion(profile, user) {
  let score = 0

  const firstName = user?.first_name || ''
  if (typeof firstName === 'string' && firstName.trim().length > 0) {
    score += 20
  }

  const lastName = user?.last_name || ''
  if (typeof lastName === 'string' && lastName.trim().length > 0) {
    score += 20
  }

  const bio = profile?.bio || ''
  if (typeof bio === 'string' && bio.trim().length > 0) {
    score += 20
  }

  const location = profile?.location || ''
  if (typeof location === 'string' && location.trim().length > 0) {
    score += 20
  }

  const website = profile?.website || ''
  if (getSafeProfileUrl(website) !== null) {
    score += 20
  }

  return score
}
