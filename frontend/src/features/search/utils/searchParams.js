export function parseSearchQuery(searchParams) {
  if (!searchParams) {
    return ''
  }

  const values = searchParams.getAll('q')
  if (values.length !== 1) {
    return ''
  }

  const trimmed = values[0].trim()
  return trimmed
}

export function parseSearchPage(searchParams) {
  if (!searchParams) {
    return 1
  }

  const values = searchParams.getAll('page')
  const candidate = values.length === 1 ? values[0] : ''
  const page = /^[1-9]\d*$/.test(candidate) ? Number(candidate) : 1

  return Number.isSafeInteger(page) ? page : 1
}

export function buildSearchPath(query, page = 1) {
  const trimmed = (query || '').trim()
  if (!trimmed) {
    return '/search'
  }

  const params = new URLSearchParams()
  params.set('q', trimmed)

  if (page > 1) {
    params.set('page', String(page))
  }

  return `/search?${params.toString()}`
}

export function isCanonicalSearchUrl(searchParams, query, page) {
  const trimmed = (query || '').trim()
  if (!trimmed) {
    return !searchParams || searchParams.toString() === ''
  }

  const expected = new URLSearchParams()
  expected.set('q', trimmed)
  if (page > 1) {
    expected.set('page', String(page))
  }

  return searchParams ? searchParams.toString() === expected.toString() : false
}

export function getVisibleSearchPages(currentPage, totalPages) {
  const candidates = [
    1,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    totalPages,
  ]
  const pages = [...new Set(candidates)]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right)

  return pages.flatMap((page, index) => {
    const previousPage = pages[index - 1]
    return index > 0 && page - previousPage > 1
      ? [`ellipsis-${previousPage}`, page]
      : [page]
  })
}
