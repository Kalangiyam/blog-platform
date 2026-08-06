import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { apiClient } from '../../../lib/apiClient.js'
import {
  getCurrentProfile,
  getPublicProfile,
  updateCurrentProfile,
} from './profilesApi.js'
import { PROFILE_ERROR_CODES } from '../utils/normalizeProfileError.js'

describe('profilesApi', () => {
  let mockAxios

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient)
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('getPublicProfile', () => {
    it('fetches public profile using encoded username', async () => {
      const mockData = {
        username: 'john_doe',
        bio: 'Hello world',
        website: 'https://john.example.com',
        location: 'NYC',
      }
      mockAxios.onGet('/users/john_doe/profile/').reply(200, mockData)

      const profile = await getPublicProfile('john_doe')
      expect(profile).toEqual(mockData)
    })

    it('encodes special characters in username', async () => {
      mockAxios.onGet('/users/user%20name/profile/').reply(200, { username: 'user name' })

      const profile = await getPublicProfile('user name')
      expect(profile.username).toBe('user name')
    })

    it('returns normalized NOT_FOUND error on 404', async () => {
      mockAxios.onGet('/users/unknown/profile/').reply(404, { detail: 'Not found.' })

      await expect(getPublicProfile('unknown')).rejects.toMatchObject({
        code: PROFILE_ERROR_CODES.NOT_FOUND,
      })
    })
  })

  describe('getCurrentProfile', () => {
    it('fetches authenticated current user profile', async () => {
      const mockData = {
        username: 'john_doe',
        email: 'john@example.com',
        bio: 'Hello',
        website: 'https://example.com',
        location: 'NYC',
        date_of_birth: '1990-01-01',
      }
      mockAxios.onGet('/profile/').reply(200, mockData)

      const profile = await getCurrentProfile()
      expect(profile).toEqual(mockData)
    })

    it('normalizes 401 unauthorized error', async () => {
      mockAxios.onGet('/profile/').reply(401, { detail: 'Authentication credentials were not provided.' })

      await expect(getCurrentProfile()).rejects.toMatchObject({
        code: PROFILE_ERROR_CODES.UNAUTHENTICATED,
      })
    })
  })

  describe('updateCurrentProfile', () => {
    it('sends PATCH request with payload and returns updated profile', async () => {
      const patchPayload = { bio: 'Updated bio' }
      const updatedProfile = {
        username: 'john_doe',
        email: 'john@example.com',
        bio: 'Updated bio',
        website: 'https://example.com',
        location: 'NYC',
        date_of_birth: '1990-01-01',
      }
      mockAxios.onPatch('/profile/', patchPayload).reply(200, updatedProfile)

      const result = await updateCurrentProfile(patchPayload)
      expect(result).toEqual(updatedProfile)
    })

    it('normalizes 400 validation error', async () => {
      mockAxios.onPatch('/profile/').reply(400, {
        bio: ['Ensure this field has no more than 500 characters.'],
      })

      await expect(updateCurrentProfile({ bio: 'too long' })).rejects.toMatchObject({
        code: PROFILE_ERROR_CODES.VALIDATION_ERROR,
        fieldErrors: {
          bio: ['Ensure this field has no more than 500 characters.'],
        },
      })
    })
  })
})
