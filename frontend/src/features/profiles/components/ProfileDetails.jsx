import ProfileAvatarPlaceholder from './ProfileAvatarPlaceholder.jsx'
import ProfileField from './ProfileField.jsx'
import { getSafeProfileUrl } from '../utils/safeProfileUrl.js'

/**
 * Public/Private profile presentation component.
 * Plain-text rendering for untrusted user inputs. No dangerouslySetInnerHTML.
 *
 * @param {{ profile: { username: string, email?: string, bio?: string, website?: string, location?: string, date_of_birth?: string|null }, isPrivate?: boolean, actionButton?: React.ReactNode }} props
 */
export default function ProfileDetails({ profile, isPrivate = false, actionButton = null }) {
  if (!profile) {
    return null
  }

  const { username, email, bio, website, location, date_of_birth } = profile
  const safeWebsiteUrl = getSafeProfileUrl(website)

  const hasOptionalDetails = Boolean(
    (bio && bio.trim()) ||
    (location && location.trim()) ||
    safeWebsiteUrl ||
    (isPrivate && (email || date_of_birth))
  )

  return (
    <article className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <ProfileAvatarPlaceholder size="xl" username={username} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl break-words">
                {username}
              </h1>
              {isPrivate && email ? (
                <p className="text-sm font-medium text-slate-500 break-words">{email}</p>
              ) : null}
            </div>

            {actionButton ? <div className="mt-2 sm:mt-0">{actionButton}</div> : null}
          </div>

          {/* Biography as safe plain text */}
          {bio && bio.trim() ? (
            <p className="mt-4 whitespace-pre-line text-base text-slate-700 leading-relaxed break-words">
              {bio.trim()}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        {hasOptionalDetails ? (
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {location && location.trim() ? (
              <ProfileField label="Location" value={location.trim()} />
            ) : null}

            {safeWebsiteUrl ? (
              <ProfileField label="Website">
                <a
                  className="font-medium text-indigo-600 underline hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 break-all"
                  href={safeWebsiteUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {website.trim()}
                </a>
              </ProfileField>
            ) : null}

            {isPrivate && date_of_birth ? (
              <ProfileField label="Date of Birth" value={date_of_birth} />
            ) : null}
          </dl>
        ) : (
          <p className="text-sm italic text-slate-500 text-center sm:text-left">
            This user has not added profile details yet.
          </p>
        )}
      </div>
    </article>
  )
}
