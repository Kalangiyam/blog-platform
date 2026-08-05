const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!rawApiBaseUrl) {
  throw new Error(
    'Missing required environment variable: VITE_API_BASE_URL',
  )
}

let parsedApiBaseUrl

try {
  parsedApiBaseUrl = new URL(rawApiBaseUrl)
} catch {
  throw new Error(
    'VITE_API_BASE_URL must be a valid absolute URL.',
  )
}

if (!['http:', 'https:'].includes(parsedApiBaseUrl.protocol)) {
  throw new Error(
    'VITE_API_BASE_URL must use the HTTP or HTTPS protocol.',
  )
}

if (parsedApiBaseUrl.username || parsedApiBaseUrl.password) {
  throw new Error(
    'VITE_API_BASE_URL must not contain embedded credentials.',
  )
}

export const environment = Object.freeze({
  apiBaseUrl: rawApiBaseUrl.replace(/\/+$/, ''),
  mode: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
})