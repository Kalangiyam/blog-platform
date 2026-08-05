import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section className="grid w-full place-items-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="text-sm font-bold tracking-widest text-indigo-600 uppercase">
          404 Error
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Page not found
        </h1>

        <p className="mt-5 leading-7 text-slate-600">
          The page you requested does not exist or may have been moved.
        </p>

        <Link
          className="mt-8 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          to="/"
        >
          Return home
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage