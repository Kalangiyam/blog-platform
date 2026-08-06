import { describe, expect, it } from 'vitest'

import { isCommentAuthor } from './commentOwnership.js'

describe('isCommentAuthor', () => {
  it('returns true when user.id matches comment.author.id (numbers)', () => {
    const user = { id: 5, username: 'alice' }
    const comment = { id: 101, author: { id: 5, username: 'alice' } }
    expect(isCommentAuthor(user, comment)).toBe(true)
  })

  it('returns true when user.id matches comment.author.id (string vs number)', () => {
    const user = { id: '5', username: 'alice' }
    const comment = { id: 101, author: { id: 5, username: 'alice' } }
    expect(isCommentAuthor(user, comment)).toBe(true)
  })

  it('returns false when user.id does not match comment.author.id', () => {
    const user = { id: 5, username: 'alice' }
    const comment = { id: 101, author: { id: 7, username: 'bob' } }
    expect(isCommentAuthor(user, comment)).toBe(false)
  })

  it('returns false if user is null or undefined', () => {
    const comment = { id: 101, author: { id: 5, username: 'alice' } }
    expect(isCommentAuthor(null, comment)).toBe(false)
    expect(isCommentAuthor(undefined, comment)).toBe(false)
  })

  it('returns false if comment or comment.author is null or undefined', () => {
    const user = { id: 5, username: 'alice' }
    expect(isCommentAuthor(user, null)).toBe(false)
    expect(isCommentAuthor(user, { id: 101, author: null })).toBe(false)
  })

  it('falls back to username comparison when IDs are missing', () => {
    const user = { username: 'charlie' }
    const comment = { author: { username: 'charlie' } }
    expect(isCommentAuthor(user, comment)).toBe(true)
  })

  it('returns false when role is editor or admin without matching author ID', () => {
    const user = { id: 1, roles: ['editor', 'admin'], username: 'admin' }
    const comment = { id: 10, author: { id: 2, username: 'author' } }
    expect(isCommentAuthor(user, comment)).toBe(false)
  })
})
