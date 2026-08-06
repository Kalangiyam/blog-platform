/**
 * Determines whether the authenticated user is the author of a given comment.
 * Uses stable ID comparison, handling number vs string conversions safely.
 * Never infers ownership from roles or email.
 *
 * @param {Object|null} user - The current authenticated user object from auth context
 * @param {Object|null} comment - The comment object
 * @returns {boolean} True if user is the author of the comment
 */
export function isCommentAuthor(user, comment) {
  if (!user || !comment) {
    return false
  }

  const userId =
    user.id !== undefined && user.id !== null ? Number(user.id) : null
  const authorId =
    comment.author?.id !== undefined && comment.author?.id !== null
      ? Number(comment.author.id)
      : null

  if (
    userId !== null &&
    authorId !== null &&
    !Number.isNaN(userId) &&
    !Number.isNaN(authorId)
  ) {
    return userId === authorId
  }

  if (user.username && comment.author?.username) {
    return user.username === comment.author.username
  }

  return false
}
