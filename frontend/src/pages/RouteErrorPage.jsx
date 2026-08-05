import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

function RouteErrorPage() {
  const error = useRouteError()

  const status = isRouteErrorResponse(error) ? error.status : 500
  const isNotFound = status === 404

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-16">
      <section className="w-full max-w-xl text-center">
        <p className="text-sm font-bold tracking-widest text-red-600 uppercase">
          Error {status}
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
          {isNotFound ? 'Page not found' : 'Something went wrong'}
        </h1>

        <p className="mt-5 leading-7 text-slate-600">
          {isNotFound
            ? 'The requested page could not be found.'
            : 'The application could not complete this request. Please return to the home page and try again.'}
        </p>

        <Link
          className="mt-8 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/"
        >
          Return home
        </Link>
      </section>
    </main>
  )
}

export default RouteErrorPage