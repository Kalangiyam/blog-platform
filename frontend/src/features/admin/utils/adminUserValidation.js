/**
 * Pre-flight validation helper for user creation form data.
 *
 * @param {Object} formData
 * @param {string} formData.username
 * @param {string} formData.email
 * @param {string} formData.password
 * @param {string} formData.password_confirm
 * @returns {Record<string, string>} Mapping of field names to error messages
 */
export function validateUserCreateData(formData) {
  const errors = {}

  const username = typeof formData.username === 'string' ? formData.username.trim() : ''
  const email = typeof formData.email === 'string' ? formData.email.trim() : ''
  const password = typeof formData.password === 'string' ? formData.password : ''
  const passwordConfirm = typeof formData.password_confirm === 'string' ? formData.password_confirm : ''

  if (!username) {
    errors.username = 'Username is required.'
  }

  if (!email) {
    errors.email = 'Email address is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Password is required.'
  }

  if (!passwordConfirm) {
    errors.password_confirm = 'Password confirmation is required.'
  } else if (password && password !== passwordConfirm) {
    errors.password_confirm = 'Passwords do not match.'
  }

  return errors
}
