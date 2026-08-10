import ProfileHeaderCard from './ProfileHeaderCard.jsx'

/**
 * Presentational container component for displaying user profile details.
 * Wraps ProfileHeaderCard to present full profile identity and details.
 *
 * @param {{
 *   profile: { username: string, bio?: string, website?: string, location?: string, date_of_birth?: string|null },
 *   user?: any,
 *   isPrivate?: boolean,
 *   onEdit?: () => void
 * }} props
 */
export default function ProfileDetails({
  profile,
  user = null,
  isPrivate = false,
  onEdit = null,
}) {
  if (!profile) {
    return null
  }

  return (
    <section aria-label="Profile Details" className="w-full">
      <ProfileHeaderCard
        isPrivate={isPrivate}
        onEdit={onEdit}
        profile={profile}
        user={user}
      />
    </section>
  )
}
