import { getSafeProfileUrl } from '../utils/safeProfileUrl.js'

/**
 * Right-side User Information Card.
 * Displays confirmed identity attributes for private profiles, or safe public attributes for public profiles.
 *
 * @param {{
 *   profile: { username: string, email?: string, date_of_birth?: string|null, location?: string, website?: string },
 *   user?: { email?: string, first_name?: string, last_name?: string } | null,
 *   isPrivate?: boolean
 * }} props
 */
export default function ProfileUserInfoCard({ profile, user = null, isPrivate = false }) {
  if (!profile) {
    return null
  }

  const username = profile.username
  const email = profile.email || user?.email
  const firstName = (user?.first_name || '').trim()
  const lastName = (user?.last_name || '').trim()
  const dateOfBirth = profile.date_of_birth
  const location = (profile.location || '').trim()
  const safeWebsiteUrl = getSafeProfileUrl(profile.website)

  return (
    <section aria-label="User Information" className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-sm font-bold tracking-wide text-slate-900 border-b border-slate-100 pb-3">
        User Information
      </h2>

      <dl className="mt-4 space-y-4 text-xs sm:text-sm">
        {/* Username */}
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-slate-500 shrink-0">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Username</span>
          </dt>
          <dd className="font-semibold text-slate-900 truncate text-right break-all">
            {username}
          </dd>
        </div>

        {/* Private Fields */}
        {isPrivate ? (
          <>
            {email ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate-500 shrink-0">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Email</span>
                </dt>
                <dd className="font-semibold text-slate-900 truncate text-right break-all">
                  {email}
                </dd>
              </div>
            ) : null}

            {firstName ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate-500 shrink-0">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>First Name</span>
                </dt>
                <dd className="font-semibold text-slate-900 truncate text-right">
                  {firstName}
                </dd>
              </div>
            ) : null}

            {lastName ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate-500 shrink-0">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Last Name</span>
                </dt>
                <dd className="font-semibold text-slate-900 truncate text-right">
                  {lastName}
                </dd>
              </div>
            ) : null}

            {dateOfBirth ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate-500 shrink-0">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Date of Birth</span>
                </dt>
                <dd className="font-semibold text-slate-900 truncate text-right">
                  {dateOfBirth}
                </dd>
              </div>
            ) : null}
          </>
        ) : (
          <>
            {/* Public Attributes */}
            {location ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate-500 shrink-0">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Location</span>
                </dt>
                <dd className="font-semibold text-slate-900 truncate text-right">
                  {location}
                </dd>
              </div>
            ) : null}

            {safeWebsiteUrl ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-slate-500 shrink-0">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Website</span>
                </dt>
                <dd className="font-semibold text-indigo-600 truncate text-right break-all">
                  <a
                    className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    href={safeWebsiteUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {profile.website?.trim()}
                  </a>
                </dd>
              </div>
            ) : null}
          </>
        )}
      </dl>
    </section>
  )
}
