import { Link, Outlet } from 'react-router'

import AuthNavigation from '../features/auth/components/AuthNavigation.jsx'

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            className="text-lg font-bold tracking-tight text-slate-900"
            to="/"
          >
            Blog Platform
          </Link>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-4">
            <nav aria-label="Primary navigation">
              <Link
                className="text-sm font-medium text-slate-600 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                to="/"
              >
                Home
              </Link>
            </nav>

            <AuthNavigation />
          </div>
        </div>
      </header>

      <main className="flex flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-5 text-center text-sm text-slate-500">
          Production-Grade Blog Platform
        </div>
      </footer>
    </div>
  )
}

export default RootLayout
