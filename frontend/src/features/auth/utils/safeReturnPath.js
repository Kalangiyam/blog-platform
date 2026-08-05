const INTERNAL_ORIGIN = 'https://blog-platform.internal'
const SAFE_FALLBACK_PATH = '/'

export function safeReturnPath(value) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return SAFE_FALLBACK_PATH
  }

  try {
    const parsedPath = new URL(value, INTERNAL_ORIGIN)

    if (parsedPath.origin !== INTERNAL_ORIGIN) {
      return SAFE_FALLBACK_PATH
    }

    return `${parsedPath.pathname}${parsedPath.search}${parsedPath.hash}`
  } catch {
    return SAFE_FALLBACK_PATH
  }
}

export function safeReturnPathFromState(state) {
  const from = state?.from

  if (!from || typeof from !== 'object' || Array.isArray(from)) {
    return SAFE_FALLBACK_PATH
  }

  const { pathname, search = '', hash = '' } = from

  if (
    typeof pathname !== 'string' ||
    typeof search !== 'string' ||
    typeof hash !== 'string' ||
    (search && !search.startsWith('?')) ||
    (hash && !hash.startsWith('#'))
  ) {
    return SAFE_FALLBACK_PATH
  }

  return safeReturnPath(`${pathname}${search}${hash}`)
}
