import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '../../../lib/apiClient.js'
import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import MyProfilePage from './MyProfilePage.jsx'

const authenticatedUser = {
  id: 1,
  username: 'currentuser',
  email: 'current@example.com',
  first_name: '',
  last_name: '',
  roles: [],
}

const authValue = {
  user: authenticatedUser,
  status: AUTH_STATUS.AUTHENTICATED,
  isAuthenticated: true,
  authError: null,
  login: () => {},
  logout: () => {},
  clearAuthError: () => {},
  hasRole: () => false,
  hasAnyRole: () => false,
}

describe('MyProfilePage', () => {
  let mockAxios

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  function renderPage() {
    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route element={<MyProfilePage />} path="/profile" />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )
  }

  const initialProfile = {
    username: 'currentuser',
    email: 'current@example.com',
    bio: 'Initial Bio',
    website: 'https://initial.com',
    location: 'Boston',
    date_of_birth: '1992-04-12',
  }

  it('loads and displays authenticated current user profile', async () => {
    mockAxios.onGet('/profile/').reply(200, initialProfile)

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'currentuser' })).toBeInTheDocument()
    })

    expect(screen.getByText('current@example.com')).toBeInTheDocument()
    expect(screen.getByText('Initial Bio')).toBeInTheDocument()
    expect(screen.getByText('1992-04-12')).toBeInTheDocument()
  })

  it('allows toggling edit mode and submitting partial PATCH updates', async () => {
    const user = userEvent.setup()

    mockAxios.onGet('/profile/').reply(200, initialProfile)
    mockAxios.onPatch('/profile/').reply(200, {
      ...initialProfile,
      bio: 'Updated Bio Text',
    })

    renderPage()

    let profileCard
    await waitFor(() => {
      profileCard = screen
        .getByRole('heading', { level: 1, name: 'currentuser' })
        .closest('article')
      expect(within(profileCard).getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument()
    })

    await user.click(within(profileCard).getByRole('button', { name: 'Edit Profile' }))

    expect(screen.getByLabelText(/biography/i)).toHaveValue('Initial Bio')

    const bioInput = screen.getByLabelText(/biography/i)
    await user.clear(bioInput)
    await user.type(bioInput, 'Updated Bio Text')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText('Updated Bio Text')).toBeInTheDocument()
    })
  })
})
