import { calculateProfileCompletion } from '../utils/profileCompletion.js'

/**
 * Left sidebar profile completion card featuring a circular SVG progress ring.
 * Rendered strictly for the current authenticated user on their private profile.
 *
 * @param {{ profile: any, user: any, onEdit?: () => void }} props
 */
export default function ProfileCompletionCard({ profile, user, onEdit }) {
  const completion = calculateProfileCompletion(profile, user)

  // SVG circular progress parameters
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (completion / 100) * circumference

  return (
    <section aria-label="Profile Completion" className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center">
      <h2 className="text-sm font-bold tracking-wide text-slate-900">
        Profile Completion
      </h2>

      {/* Circular Progress Meter */}
      <div className="relative my-5 inline-flex items-center justify-center">
        <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-slate-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="text-indigo-600 transition-all duration-700 ease-out"
            fill="none"
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            {completion}%
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">
        Complete your profile details to help others know you better.
      </p>

      {onEdit ? (
        <button
          className="mt-5 inline-flex items-center justify-center gap-1.5 w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-2xs transition hover:bg-indigo-50 hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onEdit}
          type="button"
        >
          <svg className="h-3.5 w-3.5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Edit Profile</span>
        </button>
      ) : null}
    </section>
  )
}
