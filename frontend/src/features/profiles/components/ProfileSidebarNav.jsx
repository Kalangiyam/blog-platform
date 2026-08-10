import { Link, useLocation } from 'react-router'

/**
 * Card-style navigation sidebar for the user profile page.
 * Displays only verified, active application routes.
 *
 * @param {{ isAuthorOrEditor?: boolean }} props
 */
export default function ProfileSidebarNav({ isAuthorOrEditor = false }) {
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = [
    {
      label: 'Profile Overview',
      to: '/profile',
      exact: true,
      icon: (
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    ...(isAuthorOrEditor
      ? [
          {
            label: 'My Posts',
            to: '/dashboard/posts',
            icon: (
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
          },
        ]
      : []),
    {
      label: 'Change Password',
      to: '/account/security/password',
      icon: (
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]

  return (
    <nav aria-label="Profile Navigation" className="w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
      <ul className="flex flex-row flex-wrap gap-1 md:flex-col">
        {navItems.map((item) => {
          const isActive = item.exact
            ? currentPath === item.to
            : currentPath.startsWith(item.to)

          return (
            <li key={item.to} className="flex-1 md:flex-none">
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                to={item.to}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
