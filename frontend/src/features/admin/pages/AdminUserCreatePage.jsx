import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import UserCreateForm from '../components/UserCreateForm.jsx'
import UserCreateSidebar from '../components/UserCreateSidebar.jsx'
import { createAdminUser } from '../api/adminUsersApi.js'

export default function AdminUserCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleCreateUser(userData) {
    setIsSubmitting(true)
    setError(null)

    try {
      const createdUser = await createAdminUser(userData)
      navigate(`/admin/users/${createdUser.id}`, {
        replace: true,
        state: { message: `Account created successfully for ${createdUser.username}.` },
      })
    } catch (err) {
      setError(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header & Breadcrumb Navigation */}
        <div className="space-y-2">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-slate-500">
              <li>
                <Link
                  className="font-medium text-slate-600 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                &rsaquo;
              </li>
              <li>
                <Link
                  className="font-medium text-slate-600 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  to="/admin/users"
                >
                  Users
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-400">
                &rsaquo;
              </li>
              <li>
                <span aria-current="page" className="font-semibold text-slate-900">
                  Create User
                </span>
              </li>
            </ol>
          </nav>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Create User Account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Provision a new user account with initial application roles.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Desktop Grid / Single-Column Mobile Shell */}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <main className="min-w-0">
            <UserCreateForm
              error={error}
              isSubmitting={isSubmitting}
              onSubmit={handleCreateUser}
            />
          </main>
          <UserCreateSidebar />
        </div>
      </div>
    </div>
  )
}
