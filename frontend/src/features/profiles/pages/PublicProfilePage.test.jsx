import { render, screen, waitFor, within } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '../../../lib/apiClient.js'
import { AuthContext, AUTH_STATUS } from '../../auth/context/AuthContext.js'
import PublicProfilePage from './PublicProfilePage.jsx'

const anonymousAuthValue = {
  user: null,
  status: AUTH_STATUS.UNAUTHENTICATED,
  isAuthenticated: false,
  authError: null,
  login: () => {},
  logout: () => {},
  clearAuthError: () => {},
  hasRole: () => false,
  hasAnyRole: () => false,
}

describe('PublicProfilePage', () => {
  let mockAxios

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  function renderPage(username = 'johndoe', authValue = anonymousAuthValue) {
    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[`/users/${username}`]}>
          <Routes>
            <Route element={<PublicProfilePage />} path="/users/:username" />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )
  }

  it('renders loading skeleton initially and public profile on success', async () => {
    const publicProfileData = {
      username: 'johndoe',
      bio: 'Public developer bio',
      website: 'https://johndoe.com',
      location: 'San Francisco',
      email: 'must-not-render@example.com',
      date_of_birth: '1990-01-01',
    }

    mockAxios.onGet('/users/johndoe/profile/').reply(200, publicProfileData)

    renderPage('johndoe')

    expect(screen.getByRole('status', { name: /loading profile/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'johndoe' })).toBeInTheDocument()
    })

    expect(screen.getByText('Public developer bio')).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'User Information' })).getByText('San Francisco'),
    ).toBeInTheDocument()
    expect(screen.queryByText('must-not-render@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText('1990-01-01')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Manage My Private Profile' })).not.toBeInTheDocument()
  })

  it('shows own-profile controls only to the authenticated profile owner', async () => {
    mockAxios.onGet('/users/johndoe/profile/').reply(200, {
      username: 'johndoe',
      bio: 'Public developer bio',
      website: '',
      location: '',
    })

    renderPage('johndoe', {
      ...anonymousAuthValue,
      user: { id: 2, username: 'JohnDoe', roles: [] },
      status: AUTH_STATUS.AUTHENTICATED,
      isAuthenticated: true,
    })

    expect(
      await screen.findByRole('link', { name: 'Manage My Private Profile' }),
    ).toHaveAttribute('href', '/profile')
  })

  it('renders 404 state when username is unknown', async () => {
    mockAxios.onGet('/users/unknownuser/profile/').reply(404, { detail: 'Not found.' })

    renderPage('unknownuser')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /user profile not found/i })).toBeInTheDocument()
    })
  })

  it('renders retryable error component on server failure', async () => {
    mockAxios.onGet('/users/servererror/profile/').reply(500)

    renderPage('servererror')

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})
