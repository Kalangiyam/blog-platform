export function parsePostsPage(searchParams) {
  const values = searchParams.getAll('page')
  const candidate = values.length === 1 ? values[0] : ''
  const page = /^[1-9]\d*$/.test(candidate) ? Number(candidate) : 1

  return Number.isSafeInteger(page) ? page : 1
}

export function getPostsSearch(page) {
  return page > 1 ? `?page=${page}` : ''
}

export function isCanonicalPostsSearch(searchParams, page) {
  return searchParams.toString() === getPostsSearch(page).slice(1)
}

export function getVisiblePostPages(currentPage, totalPages) {
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
