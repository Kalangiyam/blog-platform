import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { createAdminUser } from '../api/adminUsersApi.js'
import UserCreateForm from '../components/UserCreateForm.jsx'

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
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to="/admin/users"
          >
            &larr; Back to User List
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create User Account
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Provision a new user account with initial application roles.
          </p>
        </div>

        <UserCreateForm error={error} isSubmitting={isSubmitting} onSubmit={handleCreateUser} />
      </div>
    </div>
  )
}
