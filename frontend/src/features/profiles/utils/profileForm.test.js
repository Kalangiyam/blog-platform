import { describe, expect, it } from 'vitest'
import {
  getChangedProfileFields,
  validateProfileForm,
} from './profileForm.js'

describe('getChangedProfileFields', () => {
  const baseline = {
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'Initial bio',
    website: 'https://example.com',
    location: 'New York',
    date_of_birth: '1990-01-01',
  }

  it('returns empty object when no fields have changed', () => {
    const current = { ...baseline }
    const changed = getChangedProfileFields(current, baseline)
    expect(changed).toEqual({})
  })

  it('ignores read-only / protected fields (username, email, id, etc.)', () => {
    const current = {
      ...baseline,
      username: 'hacked_username',
      email: 'hacked@example.com',
      id: 999,
      role: 'admin',
    }
    const changed = getChangedProfileFields(current, baseline)
    expect(changed).toEqual({})
  })

  it('detects single writable field changes', () => {
    const current = { ...baseline, bio: 'Updated bio text' }
    const changed = getChangedProfileFields(current, baseline)
    expect(changed).toEqual({ bio: 'Updated bio text' })
  })

  it('handles clearing string fields and date_of_birth normalization to null', () => {
    const current = {
      ...baseline,
      bio: '',
      date_of_birth: '',
    }
    const changed = getChangedProfileFields(current, baseline)
    expect(changed).toEqual({
      bio: '',
      date_of_birth: null,
    })
  })
})

describe('validateProfileForm', () => {
  it('passes valid complete values', () => {
    const result = validateProfileForm({
      bio: 'Short bio',
      location: 'London',
      website: 'https://example.com',
      date_of_birth: '1995-05-15',
    })
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('validates bio maximum length of 500', () => {
    const result = validateProfileForm({
      bio: 'a'.repeat(501),
    })
    expect(result.isValid).toBe(false)
    expect(result.errors.bio).toContain('500 characters')
  })

  it('validates location maximum length of 100', () => {
    const result = validateProfileForm({
      location: 'b'.repeat(101),
    })
    expect(result.isValid).toBe(false)
    expect(result.errors.location).toContain('100 characters')
  })

  it('validates website format', () => {
    const invalidRes = validateProfileForm({
      website: 'javascript:alert(1)',
    })
    expect(invalidRes.isValid).toBe(false)
    expect(invalidRes.errors.website).toBeDefined()
  })

  it('validates date of birth format and future dates', () => {
    const formatErr = validateProfileForm({ date_of_birth: '15-05-1995' })
    expect(formatErr.isValid).toBe(false)
    expect(formatErr.errors.date_of_birth).toContain('YYYY-MM-DD')

    const futureYear = new Date().getFullYear() + 1
    const futureErr = validateProfileForm({ date_of_birth: `${futureYear}-01-01` })
    expect(futureErr.isValid).toBe(false)
    expect(futureErr.errors.date_of_birth).toContain('future')
  })
})
