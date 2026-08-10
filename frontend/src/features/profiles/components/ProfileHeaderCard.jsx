import ProfileAvatarPlaceholder from './ProfileAvatarPlaceholder.jsx'
import { getSafeProfileUrl } from '../utils/safeProfileUrl.js'

/**
 * Main Profile Header Card.
 * Renders avatar, display name, username, multiple role badges (private only),
 * biography, location, website, and owner Edit button.
 *
 * @param {{
 *   profile: { username: string, bio?: string, website?: string, location?: string },
 *   user?: { first_name?: string, last_name?: string, roles?: string[] } | null,
 *   isPrivate?: boolean,
 *   onEdit?: () => void
 * }} props
 */
export default function ProfileHeaderCard({
  profile,
  user = null,
  isPrivate = false,
  onEdit = null,
}) {
  if (!profile) {
    return null
  }

  const { username, bio, website, location } = profile

  // Construct display name fallback
  const firstName = (user?.first_name || '').trim()
  const lastName = (user?.last_name || '').trim()
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const displayName = fullName || username

  // Roles rendering (private profile only, supporting multiple roles)
  const roles = isPrivate && Array.isArray(user?.roles) ? user.roles : []

  // Safe external website URL check
  const safeWebsiteUrl = getSafeProfileUrl(website)

  return (
    <article className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Identity Group: Avatar + Details */}
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
          <ProfileAvatarPlaceholder
            name={displayName}
            size="xl"
            username={username}
          />

          <div className="space-y-1.5 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl break-words">
              {displayName}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="text-sm font-semibold text-slate-500 break-all">
                @{username}
              </span>

              {/* Multiple Role Badges (Private Profile Only) */}
              {roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-700/10 ring-inset"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button: Edit Profile */}
        {isPrivate && onEdit ? (
          <div className="flex shrink-0 justify-center sm:justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-2xs transition hover:bg-indigo-50 hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={onEdit}
              type="button"
            >
              <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Edit Profile</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Biography */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        {bio && bio.trim() ? (
          <p className="whitespace-pre-line text-sm text-slate-700 leading-relaxed break-words">
            {bio.trim()}
          </p>
        ) : (
          <p className="text-sm italic text-slate-400">
            {isPrivate
              ? 'No biography provided yet. Click Edit Profile to share a brief bio.'
              : 'No biography provided.'}
          </p>
        )}
      </div>

      {/* Location & Website links */}
      {(location && location.trim()) || safeWebsiteUrl ? (
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 border-t border-slate-100 pt-4">
          {location && location.trim() ? (
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="break-words">{location.trim()}</span>
            </div>
          ) : null}

          {safeWebsiteUrl ? (
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <a
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 break-all"
                href={safeWebsiteUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {website.trim()}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
