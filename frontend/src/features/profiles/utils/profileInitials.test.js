import { describe, expect, it } from 'vitest'
import { getProfileInitials } from './profileInitials.js'

describe('getProfileInitials', () => {
  it('returns "?" for non-string, empty, or whitespace-only inputs', () => {
    expect(getProfileInitials(null)).toBe('?')
    expect(getProfileInitials(undefined)).toBe('?')
    expect(getProfileInitials(123)).toBe('?')
    expect(getProfileInitials('')).toBe('?')
    expect(getProfileInitials('   ')).toBe('?')
  })

  it('returns single uppercase initial for single-word usernames', () => {
    expect(getProfileInitials('alice')).toBe('A')
    expect(getProfileInitials('Bob')).toBe('B')
  })

  it('returns two initials for space-separated names', () => {
    expect(getProfileInitials('Jane Doe')).toBe('JD')
    expect(getProfileInitials('john middle smith')).toBe('JS')
  })

  it('handles underscore and hyphen separated usernames', () => {
    expect(getProfileInitials('john_doe')).toBe('JD')
    expect(getProfileInitials('mary-jane-watson')).toBe('MW')
  })

  it('handles Unicode and special characters gracefully', () => {
    expect(getProfileInitials('Élodie Martin')).toBe('ÉM')
  })
})
