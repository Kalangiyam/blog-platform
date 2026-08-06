import { useAuthorization } from '../hooks/useAuthorization.js'

/**
 * Declarative component for permission-aware UI rendering.
 *
 * Usage examples:
 * 1. Condition-based:
 *    <Can when={canEditPost(post)}>
 *      <EditButton />
 *    </Can>
 *
 * 2. Rule function based:
 *    <Can rule={(auth) => auth.canEditPost(post)}>
 *      <EditButton />
 *    </Can>
 *
 * @param {Object} props
 * @param {boolean} [props.when] - Direct boolean permission evaluation
 * @param {Function} [props.rule] - Authorization rule evaluator callback receiving auth object
 * @param {React.ReactNode} [props.fallback=null] - Optional element rendered when permission is denied
 * @param {React.ReactNode} props.children - Element rendered when permission is granted
 */
export default function Can({ when, rule, fallback = null, children }) {
  const auth = useAuthorization()

  let isAllowed = false

  if (typeof when === 'boolean') {
    isAllowed = when
  } else if (typeof rule === 'function') {
    isAllowed = Boolean(rule(auth))
  }

  if (!isAllowed) {
    return fallback
  }

  return children
}
