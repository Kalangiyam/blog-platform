import { describe, expect, it } from 'vitest'

import {
  safeReturnPath,
  safeReturnPathFromState,
} from './safeReturnPath.js'

describe('safeReturnPath', () => {
  it.each([
    '/posts/new',
    '/profile',
    '/admin/users?page=2',
    '/posts?sort=recent#comments',
  ])('preserves the internal path %s', (path) => {
    expect(safeReturnPath(path)).toBe(path)
  })

  it.each([
    ['an absolute URL', 'https://malicious.example/account'],
    ['a protocol-relative URL', '//malicious.example/account'],
    ['a JavaScript URL', 'javascript:alert(1)'],
    ['a data URL', 'data:text/html,unsafe'],
    ['a path without a leading slash', 'profile'],
    ['a path containing backslashes', '/safe\\..\\unsafe'],
    ['a non-string value', { pathname: '/profile' }],
    ['a null value', null],
  ])('falls back for %s', (_description, value) => {
    expect(safeReturnPath(value)).toBe('/')
  })
})

describe('safeReturnPathFromState', () => {
  it('reconstructs a safe attempted location with search and hash', () => {
    expect(
      safeReturnPathFromState({
        from: {
          pathname: '/admin/users',
          search: '?page=2',
          hash: '#pending',
        },
      }),
    ).toBe('/admin/users?page=2#pending')
  })

  it.each([
    ['missing state', undefined],
    ['a string from value', { from: '/profile' }],
    ['an array from value', { from: ['/profile'] }],
    [
      'a protocol-relative pathname',
      {
        from: {
          pathname: '//malicious.example',
          search: '',
          hash: '',
        },
      },
    ],
    [
      'a malformed search value',
      {
        from: {
          pathname: '/profile',
          search: 'next=unsafe',
          hash: '',
        },
      },
    ],
    [
      'a malformed hash value',
      {
        from: {
          pathname: '/profile',
          search: '',
          hash: 'section',
        },
      },
    ],
  ])('falls back for %s', (_description, state) => {
    expect(safeReturnPathFromState(state)).toBe('/')
  })
})
