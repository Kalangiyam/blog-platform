import { Link } from 'react-router'

/**
 * Reusable, accessible component for 403 Forbidden states.
 * Renders a clean explanation and safe navigation options.
 *
 * @param {Object} props
 * @param {string} [props.title='Access Restricted']
 * @param {string} [props.message='You are signed in, but your account does not have permission to access this area.']
 * @param {string} [props.backUrl='/']
 * @param {string} [props.backText='Return to Home']
 */
export default function ForbiddenState({
  title = 'Access Restricted',
  message = 'You are signed in, but your account does not have permission to access this area.',
  backUrl = '/',
  backText = 'Return to Home',
}) {
  return (
    <section className="grid w-full place-items-center px-6 py-16 text-center">
      <div className="max-w-xl">
        <p className="text-sm font-bold tracking-widest text-amber-600 uppercase">
          403 Forbidden
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          {message}
        </p>
        <div className="mt-8 flex items-center justify-center gap-x-4">
          <Link
            className="inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            to={backUrl}
          >
            {backText}
          </Link>
        </div>
      </div>
    </section>
  )
}
