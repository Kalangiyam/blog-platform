const postDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: 'UTC',
})

export function formatPostDate(value) {
  if (!value) {
    return 'Date unavailable'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return postDateFormatter.format(date)
}
