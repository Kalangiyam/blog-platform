function TaxonomyList({ items, label, tone = 'slate' }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null
  }

  const toneClasses =
    tone === 'indigo'
      ? 'bg-indigo-50 text-indigo-700'
      : 'bg-slate-100 text-slate-700'

  return (
    <div aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses}`}
          key={item.slug}
        >
          {item.name}
        </span>
      ))}
    </div>
  )
}

function PostTaxonomy({ categories, tags }) {
  return (
    <div className="space-y-2">
      <TaxonomyList items={categories} label="Categories" tone="indigo" />
      <TaxonomyList items={tags} label="Tags" />
    </div>
  )
}

export default PostTaxonomy
