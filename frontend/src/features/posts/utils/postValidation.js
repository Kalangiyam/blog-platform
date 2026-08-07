/**
 * Client-side validation for post creation and update forms.
 *
 * @param {{ title?: string, excerpt?: string, content?: string, category_slugs?: string[], tag_slugs?: string[] }} formData
 * @returns {{ isValid: boolean, errors: Record<string, string[]> }}
 */
export function validatePostForm(formData = {}) {
  const errors = {}

  const title = typeof formData.title === 'string' ? formData.title.trim() : ''
  const excerpt = typeof formData.excerpt === 'string' ? formData.excerpt.trim() : ''
  const content = typeof formData.content === 'string' ? formData.content.trim() : ''

  if (!title) {
    errors.title = ['Title is required.']
  } else if (title.length > 255) {
    errors.title = ['Title cannot exceed 255 characters.']
  }

  if (excerpt.length > 500) {
    errors.excerpt = ['Excerpt cannot exceed 500 characters.']
  }

  if (!content) {
    errors.content = ['Content is required.']
  }

  if (formData.category_slugs !== undefined && !Array.isArray(formData.category_slugs)) {
    errors.category_slugs = ['Categories must be an array of slugs.']
  }

  if (formData.tag_slugs !== undefined && !Array.isArray(formData.tag_slugs)) {
    errors.tag_slugs = ['Tags must be an array of slugs.']
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
