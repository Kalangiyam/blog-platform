import { Link } from 'react-router'

export default function UnauthorizedPage() {
  return (
    <section className="grid w-full place-items-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="text-sm font-bold tracking-widest text-amber-600 uppercase">
          403 — Access restricted
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Your account does not have access
        </h1>

        <p className="mt-5 leading-7 text-slate-600">
          This area requires an application role that is not assigned to your
          account.
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
