function HomePage() {
  return (
    <section className="grid w-full place-items-center px-6 py-16">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 sm:p-12">
        <p className="mb-3 text-sm font-bold tracking-widest text-indigo-600 uppercase">
          Frontend Feature 01
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Production-Grade Blog Platform
        </h1>

        <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
          React, Vite, Tailwind CSS, and React Router are configured
          successfully.
        </p>
      </div>
    </section>
  )
}

export default HomePage