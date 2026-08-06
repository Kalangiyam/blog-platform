import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '../../../lib/apiClient.js'
import MyProfilePage from './MyProfilePage.jsx'

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
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<MyProfilePage />} path="/profile" />
        </Routes>
      </MemoryRouter>
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
      expect(screen.getByRole('heading', { level: 1, name: 'My Profile' })).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { level: 1, name: 'currentuser' })).toBeInTheDocument()
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

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /edit profile/i }))

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
