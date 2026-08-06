export function parseCommentsPage(searchParams) {
  if (!searchParams) return 1
  const values = searchParams.getAll('commentsPage')
  const candidate = values.length === 1 ? values[0].trim() : ''
  const page = /^[1-9]\d*$/.test(candidate) ? Number(candidate) : 1

  return Number.isSafeInteger(page) ? page : 1
}

export function buildCommentsSearch(searchParams, page) {
  const nextParams = new URLSearchParams(searchParams)

  if (page > 1) {
    nextParams.set('commentsPage', String(page))
  } else {
    nextParams.delete('commentsPage')
  }

  const queryString = nextParams.toString()
  return queryString ? `?${queryString}` : ''
}

export function isCanonicalCommentsSearch(searchParams) {
  if (!searchParams) return true
  const page = parseCommentsPage(searchParams)
  const expectedSearch = buildCommentsSearch(searchParams, page)
  const actualSearch = searchParams.toString()
    ? `?${searchParams.toString()}`
    : ''

  return actualSearch === expectedSearch
}
