import axios from 'axios'

export const SEARCH_ERROR_CODES = Object.freeze({
  CANCELLED: 'cancelled',
  NETWORK: 'network',
  INVALID_QUERY: 'invalid_query',
  INVALID_PAGE: 'invalid_page',
  CLIENT: 'client',
  SERVER: 'server',
})

export class SearchError extends Error {
  constructor(code, detail = null) {
    super('The search request could not be completed.')
    this.name = 'SearchError'
    this.code = code
    this.detail = detail
  }
}

export function normalizeSearchError(error) {
  if (error instanceof SearchError) {
    return error
  }

  if (axios.isCancel(error) || error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
    return new SearchError(SEARCH_ERROR_CODES.CANCELLED)
  }

  if (!error?.response) {
    return new SearchError(SEARCH_ERROR_CODES.NETWORK)
  }

  const status = error.response.status
  const data = error.response.data

  if (status === 400) {
    if (data?.q) {
      return new SearchError(SEARCH_ERROR_CODES.INVALID_QUERY, data.q)
    }
    return new SearchError(SEARCH_ERROR_CODES.CLIENT, data)
  }

  if (status === 404) {
    return new SearchError(SEARCH_ERROR_CODES.INVALID_PAGE)
  }

  if (status >= 500) {
    return new SearchError(SEARCH_ERROR_CODES.SERVER)
  }

  return new SearchError(SEARCH_ERROR_CODES.CLIENT)
}
