import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProfileDetails from './ProfileDetails.jsx'

describe('ProfileDetails', () => {
  const publicProfile = {
    username: 'johndoe',
    bio: 'Software Developer & Writer',
    website: 'https://johndoe.com',
    location: 'New York, USA',
  }

  const incompleteProfile = {
    username: 'emptyuser',
    bio: '',
    website: '',
    location: '',
  }

  it('renders public profile details safely', () => {
    render(<ProfileDetails profile={publicProfile} />)

    expect(screen.getByRole('heading', { level: 1, name: 'johndoe' })).toBeInTheDocument()
    expect(screen.getByText('Software Developer & Writer')).toBeInTheDocument()
    expect(screen.getByText('New York, USA')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'https://johndoe.com' })
    expect(link).toHaveAttribute('href', 'https://johndoe.com/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not display private fields in public mode even if present in payload', () => {
    const mixedPayload = {
      ...publicProfile,
      email: 'john@secret.com',
      date_of_birth: '1990-01-01',
    }
    render(<ProfileDetails isPrivate={false} profile={mixedPayload} />)

    expect(screen.queryByText('john@secret.com')).not.toBeInTheDocument()
    expect(screen.queryByText('1990-01-01')).not.toBeInTheDocument()
  })

  it('displays email and date of birth in private mode', () => {
    const privatePayload = {
      ...publicProfile,
      email: 'john@secret.com',
      date_of_birth: '1990-01-01',
    }
    render(<ProfileDetails isPrivate={true} profile={privatePayload} />)

    expect(screen.getByText('john@secret.com')).toBeInTheDocument()
    expect(screen.getByText('1990-01-01')).toBeInTheDocument()
  })

  it('renders respectful empty state for incomplete profiles', () => {
    render(<ProfileDetails profile={incompleteProfile} />)
    expect(screen.getByText('This user has not added profile details yet.')).toBeInTheDocument()
  })

  it('does not render unsafe website schemes as clickable links', () => {
    const unsafeProfile = {
      username: 'hacker',
      website: 'javascript:alert(1)',
    }
    render(<ProfileDetails profile={unsafeProfile} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
