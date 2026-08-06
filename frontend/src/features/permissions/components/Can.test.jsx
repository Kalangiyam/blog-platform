import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import Can from './Can.jsx'

function renderCan(ui, user = null) {
  const value = {
    user,
    status: user ? AUTH_STATUS.AUTHENTICATED : AUTH_STATUS.UNAUTHENTICATED,
    isAuthenticated: Boolean(user),
    authError: null,
    login: () => {},
    logout: () => {},
    clearAuthError: () => {},
    hasRole: (role) => Array.isArray(user?.roles) && user.roles.includes(role),
    hasAnyRole: (roles) =>
      Array.isArray(user?.roles) && roles.some((r) => user.roles.includes(r)),
  }

  return render(
    <AuthContext.Provider value={value}>{ui}</AuthContext.Provider>,
  )
}

describe('Can component', () => {
  it('renders children when "when" prop is true', () => {
    renderCan(
      <Can when={true}>
        <span>Permitted Content</span>
      </Can>,
    )

    expect(screen.getByText('Permitted Content')).toBeInTheDocument()
  })

  it('renders fallback (or null) when "when" prop is false', () => {
    renderCan(
      <Can fallback={<span>Denied Content</span>} when={false}>
        <span>Permitted Content</span>
      </Can>,
    )

    expect(screen.queryByText('Permitted Content')).not.toBeInTheDocument()
    expect(screen.getByText('Denied Content')).toBeInTheDocument()
  })

  it('evaluates "rule" callback function with auth object', () => {
    const authorUser = { id: 1, roles: ['Author'] }

    renderCan(
      <Can rule={(auth) => auth.canCreatePost()}>
        <span>Create Post Button</span>
      </Can>,
      authorUser,
    )

    expect(screen.getByText('Create Post Button')).toBeInTheDocument()
  })

  it('renders fallback when rule callback returns false', () => {
    const anonymousUser = null

    renderCan(
      <Can
        fallback={<span>Login to Post</span>}
        rule={(auth) => auth.canCreatePost()}
      >
        <span>Create Post Button</span>
      </Can>,
      anonymousUser,
    )

    expect(screen.queryByText('Create Post Button')).not.toBeInTheDocument()
    expect(screen.getByText('Login to Post')).toBeInTheDocument()
  })
})
