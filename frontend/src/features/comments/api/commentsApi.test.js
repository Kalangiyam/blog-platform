import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiClientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../../../lib/apiClient.js', () => ({ apiClient: apiClientMocks }))

import { COMMENT_ERROR_CODES } from '../utils/commentErrors.js'
import {
  createPostComment,
  deleteComment,
  getPostComments,
  updateComment,
} from './commentsApi.js'

function makeAxiosError(status, data = {}) {
  return new AxiosError(
    'Request failed',
    undefined,
    {},
    {},
    {
      status,
      data,
      headers: {},
      config: {},
    },
  )
}

describe('comments API', () => {
  beforeEach(() => {
    apiClientMocks.get.mockReset()
    apiClientMocks.post.mockReset()
    apiClientMocks.patch.mockReset()
    apiClientMocks.delete.mockReset()
  })

  describe('getPostComments', () => {
    it('requests comments for post slug with page param and abort signal', async () => {
      const responseData = { count: 1, results: [{ id: 10, content: 'Hello' }] }
      const controller = new AbortController()
      apiClientMocks.get.mockResolvedValue({ data: responseData })

      const result = await getPostComments('my-post-slug', 2, {
        signal: controller.signal,
      })

      expect(result).toBe(responseData)
      expect(apiClientMocks.get).toHaveBeenCalledWith(
        '/posts/my-post-slug/comments/',
        {
          params: { page: 2 },
          signal: controller.signal,
        },
      )
    })

    it('normalizes 404 response to INVALID_PAGE error', async () => {
      apiClientMocks.get.mockRejectedValue(makeAxiosError(404))

      await expect(getPostComments('my-post', 99)).rejects.toMatchObject({
        code: COMMENT_ERROR_CODES.INVALID_PAGE,
      })
    })
  })

  describe('createPostComment', () => {
    it('sends POST request to create comment and returns response data', async () => {
      const createdComment = { id: 11, content: 'New comment' }
      apiClientMocks.post.mockResolvedValue({ data: createdComment })

      const result = await createPostComment('my-post', {
        content: 'New comment',
      })

      expect(result).toBe(createdComment)
      expect(apiClientMocks.post).toHaveBeenCalledWith(
        '/posts/my-post/comments/',
        { content: 'New comment' },
        { signal: undefined },
      )
    })

    it('normalizes 400 validation error', async () => {
      apiClientMocks.post.mockRejectedValue(
        makeAxiosError(400, { content: ['Cannot be blank.'] }),
      )

      await expect(
        createPostComment('my-post', { content: '' }),
      ).rejects.toMatchObject({
        code: COMMENT_ERROR_CODES.VALIDATION_ERROR,
        fields: { content: ['Cannot be blank.'] },
      })
    })

    it('normalizes 401 unauthorized error', async () => {
      apiClientMocks.post.mockRejectedValue(makeAxiosError(401))

      await expect(
        createPostComment('my-post', { content: 'test' }),
      ).rejects.toMatchObject({
        code: COMMENT_ERROR_CODES.UNAUTHORIZED,
      })
    })
  })

  describe('updateComment', () => {
    it('sends PATCH request to update comment', async () => {
      const updatedComment = { id: 15, content: 'Updated content' }
      apiClientMocks.patch.mockResolvedValue({ data: updatedComment })

      const result = await updateComment(15, { content: 'Updated content' })

      expect(result).toBe(updatedComment)
      expect(apiClientMocks.patch).toHaveBeenCalledWith(
        '/comments/15/',
        { content: 'Updated content' },
        { signal: undefined },
      )
    })

    it('normalizes 403 forbidden error', async () => {
      apiClientMocks.patch.mockRejectedValue(makeAxiosError(403))

      await expect(
        updateComment(15, { content: 'Updated' }),
      ).rejects.toMatchObject({
        code: COMMENT_ERROR_CODES.FORBIDDEN,
      })
    })
  })

  describe('deleteComment', () => {
    it('sends DELETE request to remove comment', async () => {
      apiClientMocks.delete.mockResolvedValue({ status: 204 })

      const result = await deleteComment(20)

      expect(result).toBe(true)
      expect(apiClientMocks.delete).toHaveBeenCalledWith('/comments/20/', {
        signal: undefined,
      })
    })

    it('normalizes 404 not found error', async () => {
      apiClientMocks.delete.mockRejectedValue(makeAxiosError(404))

      await expect(deleteComment(999)).rejects.toMatchObject({
        code: COMMENT_ERROR_CODES.NOT_FOUND,
      })
    })
  })
})
