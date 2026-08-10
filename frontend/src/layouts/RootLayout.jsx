import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'

import AuthNavigation from '../features/auth/components/AuthNavigation.jsx'
import GlobalSearchForm from '../features/search/components/GlobalSearchForm.jsx'
import { getCategories, getTags } from '../features/posts/api/postsApi.js'

function RootLayout() {
  const location = useLocation()

  // Categories & Tags Dropdown state
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [isCatOpen, setIsCatOpen] = useState(false)
  const [isTagOpen, setIsTagOpen] = useState(false)

  const catRef = useRef(null)
  const tagRef = useRef(null)

  // Fetch /api/categories/ and /api/tags/ for header dropdowns
  useEffect(() => {
    const controller = new AbortController()

    async function loadHeaderTaxonomies() {
      try {
        const [catsRes, tagsRes] = await Promise.allSettled([
          getCategories(1, { signal: controller.signal }),
          getTags(1, { signal: controller.signal }),
        ])

        if (catsRes.status === 'fulfilled' && catsRes.value) {
          const items = Array.isArray(catsRes.value) ? catsRes.value : catsRes.value?.results || []
          setCategories(items)
        }
        if (tagsRes.status === 'fulfilled' && tagsRes.value) {
          const items = Array.isArray(tagsRes.value) ? tagsRes.value : tagsRes.value?.results || []
          setTags(items)
        }
      } catch {
        // ignore abort
      }
    }

    loadHeaderTaxonomies()

    return () => controller.abort()
  }, [])

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setIsCatOpen(false)
      }
      if (tagRef.current && !tagRef.current.contains(e.target)) {
        setIsTagOpen(false)
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsCatOpen(false)
        setIsTagOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 font-sans text-slate-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          {/* Logo */}
          <Link
            className="group flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-90"
            to="/"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              BlogFlow
            </span>
          </Link>

          {/* Central Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
            <Link
              className={`relative py-1 text-sm font-semibold transition-colors ${location.pathname === '/' && !location.search.includes('category=') && !location.search.includes('tag=')
                  ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
              to="/"
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={catRef}>
              <button
                aria-expanded={isCatOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 py-1 text-sm font-semibold transition-colors cursor-pointer ${location.search.includes('category=') || isCatOpen
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
                onClick={() => {
                  setIsCatOpen(!isCatOpen)
                  setIsTagOpen(false)
                }}
                type="button"
              >
                <span>Categories</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${isCatOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isCatOpen ? (
                <div className="absolute left-0 mt-2.5 w-64 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="mb-2 px-2.5 pt-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Browse Categories
                  </div>
                  {categories.length > 0 ? (
                    <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                      {categories.map((cat) => (
                        <Link
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                          key={cat.id || cat.slug || cat.name}
                          onClick={() => setIsCatOpen(false)}
                          to={`/?category=${encodeURIComponent(cat.slug || cat.name)}`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">→</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-2 text-xs text-slate-500">No categories loaded.</p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Tags Dropdown */}
            <div className="relative" ref={tagRef}>
              <button
                aria-expanded={isTagOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 py-1 text-sm font-semibold transition-colors cursor-pointer ${location.search.includes('tag=') || isTagOpen
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
                onClick={() => {
                  setIsTagOpen(!isTagOpen)
                  setIsCatOpen(false)
                }}
                type="button"
              >
                <span>Tags</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${isTagOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isTagOpen ? (
                <div className="absolute left-0 mt-2.5 w-64 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="mb-2 px-2.5 pt-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Browse Tags
                  </div>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto p-1">
                      {tags.map((tag) => (
                        <Link
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                          key={tag.id || tag.slug || tag.name}
                          onClick={() => setIsTagOpen(false)}
                          to={`/?tag=${encodeURIComponent(tag.slug || tag.name)}`}
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-2 text-xs text-slate-500">No tags loaded.</p>
                  )}
                </div>
              ) : null}
            </div>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <GlobalSearchForm className="hidden sm:block" />

            {/* Auth Actions / Sign In Button */}
            <AuthNavigation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white text-slate-600">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <Link className="flex items-center gap-2.5" to="/">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-xs">
                  <svg
                    className="h-4.5 w-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  BlogFlow
                </span>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                A modern blog platform for developers, designers, and creators to share knowledge and ideas.
              </p>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                Navigation
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs font-medium">
                <li>
                  <Link className="transition hover:text-indigo-600" to="/">
                    Home
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-indigo-600" to="/#categories">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-indigo-600" to="/#tags">
                    Tags
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Profile */}
            <div>
              <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                Account
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs font-medium">
                <li>
                  <Link className="transition hover:text-indigo-600" to="/login">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-indigo-600" to="/profile">
                    My Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200/80 pt-6 text-center text-xs font-medium text-slate-500">
            © 2026 BlogFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default RootLayout
