import { apiClient } from '../../../lib/apiClient.js'

export async function getManagementCategories({ page = 1, signal } = {}) {
  const response = await apiClient.get('/editorial/categories/', {
    params: { page },
    signal,
  })
  return response.data
}

export async function createManagementCategory(data, { signal } = {}) {
  const response = await apiClient.post('/editorial/categories/', data, { signal })
  return response.data
}

export async function updateManagementCategory(slug, data, { signal } = {}) {
  const response = await apiClient.patch(`/editorial/categories/${encodeURIComponent(slug)}/`, data, { signal })
  return response.data
}

export async function getManagementTags({ page = 1, signal } = {}) {
  const response = await apiClient.get('/editorial/tags/', {
    params: { page },
    signal,
  })
  return response.data
}

export async function createManagementTag(data, { signal } = {}) {
  const response = await apiClient.post('/editorial/tags/', data, { signal })
  return response.data
}

export async function updateManagementTag(slug, data, { signal } = {}) {
  const response = await apiClient.patch(`/editorial/tags/${encodeURIComponent(slug)}/`, data, { signal })
  return response.data
}
