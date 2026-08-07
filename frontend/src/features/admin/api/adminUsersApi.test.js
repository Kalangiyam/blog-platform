import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '../../../lib/apiClient.js'
import {
  activateAdminUser,
  createAdminUser,
  deactivateAdminUser,
  getAdminUserDetail,
  getAdminUsers,
  updateAdminUserRoles,
} from './adminUsersApi.js'

vi.mock('../../../lib/apiClient.js', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('adminUsersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAdminUsers', () => {
    it('fetches paginated users with correct endpoint and parameters', async () => {
      const mockData = { count: 1, next: null, previous: null, results: [{ id: 1, username: 'admin' }] }
      apiClient.get.mockResolvedValueOnce({ data: mockData })

      const result = await getAdminUsers(2)

      expect(apiClient.get).toHaveBeenCalledWith('/admin/users/', {
        params: { page: 2 },
        signal: undefined,
      })
      expect(result).toEqual(mockData)
    })
  })

  describe('getAdminUserDetail', () => {
    it('fetches user details by encoded user ID', async () => {
      const mockUser = { id: 10, username: 'editor_user' }
      apiClient.get.mockResolvedValueOnce({ data: mockUser })

      const result = await getAdminUserDetail(10)

      expect(apiClient.get).toHaveBeenCalledWith('/admin/users/10/', { signal: undefined })
      expect(result).toEqual(mockUser)
    })
  })

  describe('createAdminUser', () => {
    it('posts user creation payload to /admin/users/', async () => {
      const payload = {
        username: 'new_user',
        email: 'new@example.com',
        password: 'Password123!',
        password_confirm: 'Password123!',
        roles: ['Author'],
      }
      const responseData = { id: 15, username: 'new_user', roles: ['Author'] }
      apiClient.post.mockResolvedValueOnce({ data: responseData })

      const result = await createAdminUser(payload)

      expect(apiClient.post).toHaveBeenCalledWith('/admin/users/', payload)
      expect(result).toEqual(responseData)
    })
  })

  describe('activateAdminUser', () => {
    it('posts an empty object to /admin/users/{id}/activate/', async () => {
      const responseData = { id: 5, username: 'user5', is_active: true }
      apiClient.post.mockResolvedValueOnce({ data: responseData })

      const result = await activateAdminUser(5)

      expect(apiClient.post).toHaveBeenCalledWith('/admin/users/5/activate/', {})
      expect(result).toEqual(responseData)
    })
  })

  describe('deactivateAdminUser', () => {
    it('posts an empty object to /admin/users/{id}/deactivate/', async () => {
      const responseData = { id: 5, username: 'user5', is_active: false }
      apiClient.post.mockResolvedValueOnce({ data: responseData })

      const result = await deactivateAdminUser(5)

      expect(apiClient.post).toHaveBeenCalledWith('/admin/users/5/deactivate/', {})
      expect(result).toEqual(responseData)
    })
  })

  describe('updateAdminUserRoles', () => {
    it('puts replacement roles payload to /admin/users/{id}/roles/', async () => {
      const responseData = { id: 5, username: 'user5', roles: ['Author', 'Editor'] }
      apiClient.put.mockResolvedValueOnce({ data: responseData })

      const result = await updateAdminUserRoles(5, ['Author', 'Editor'])

      expect(apiClient.put).toHaveBeenCalledWith('/admin/users/5/roles/', {
        roles: ['Author', 'Editor'],
      })
      expect(result).toEqual(responseData)
    })
  })
})
