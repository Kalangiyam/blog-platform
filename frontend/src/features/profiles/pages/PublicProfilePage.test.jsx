import { render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '../../../lib/apiClient.js'
import PublicProfilePage from './PublicProfilePage.jsx'

describe('PublicProfilePage', () => {
  let mockAxios

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  function renderPage(username = 'johndoe') {
    return render(
      <MemoryRouter initialEntries={[`/users/${username}`]}>
        <Routes>
          <Route element={<PublicProfilePage />} path="/users/:username" />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders loading skeleton initially and public profile on success', async () => {
    const publicProfileData = {
      username: 'johndoe',
      bio: 'Public developer bio',
      website: 'https://johndoe.com',
      location: 'San Francisco',
    }

    mockAxios.onGet('/users/johndoe/profile/').reply(200, publicProfileData)

    renderPage('johndoe')

    expect(screen.getByRole('status', { name: /loading profile/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'johndoe' })).toBeInTheDocument()
    })

    expect(screen.getByText('Public developer bio')).toBeInTheDocument()
    expect(screen.getByText('San Francisco')).toBeInTheDocument()
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
