import { describe, expect, it } from 'vitest'

import { validateUserCreateData } from './adminUserValidation.js'

describe('adminUserValidation', () => {
  it('detects missing required fields', () => {
    const errors = validateUserCreateData({
      username: '',
      email: '',
      password: '',
      password_confirm: '',
    })

    expect(errors.username).toBe('Username is required.')
    expect(errors.email).toBe('Email address is required.')
    expect(errors.password).toBe('Password is required.')
    expect(errors.password_confirm).toBe('Password confirmation is required.')
  })

  it('validates email format', () => {
    const errors = validateUserCreateData({
      username: 'valid_user',
      email: 'not-an-email',
      password: 'password123',
      password_confirm: 'password123',
    })

    expect(errors.email).toBe('Enter a valid email address.')
  })

  it('validates matching passwords', () => {
    const errors = validateUserCreateData({
      username: 'valid_user',
      email: 'valid@example.com',
      password: 'password123',
      password_confirm: 'different123',
    })

    expect(errors.password_confirm).toBe('Passwords do not match.')
  })

  it('returns empty errors object for valid data', () => {
    const errors = validateUserCreateData({
      username: 'valid_user',
      email: 'valid@example.com',
      password: 'password123',
      password_confirm: 'password123',
    })

    expect(Object.keys(errors)).toHaveLength(0)
  })
})
