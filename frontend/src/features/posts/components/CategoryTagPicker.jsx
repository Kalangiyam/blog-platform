export default function CategoryTagPicker({
  availableCategories = [],
  selectedCategories = [],
  onCategoryChange,
  availableTags = [],
  selectedTags = [],
  onTagChange,
  categoryErrors = [],
  tagErrors = [],
  disabled = false,
}) {
  const toggleCategory = (slug) => {
    if (disabled) return
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug]
    if (onCategoryChange) onCategoryChange(next)
  }

  const toggleTag = (slug) => {
    if (disabled) return
    const next = selectedTags.includes(slug)
      ? selectedTags.filter((s) => s !== slug)
      : [...selectedTags, slug]
    if (onTagChange) onTagChange(next)
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Categories
        </label>
        {availableCategories.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No categories available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.slug)
              return (
                <button
                  key={cat.slug}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 ring-1 ring-sky-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-pressed={isSelected}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        )}
        {categoryErrors.length > 0 && (
          <p className="mt-1.5 text-xs text-rose-400">{categoryErrors.join(' ')}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tags
        </label>
        {availableTags.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No tags available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((t) => {
              const isSelected = selectedTags.includes(t.slug)
              return (
                <button
                  key={t.slug}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleTag(t.slug)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                    isSelected
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 ring-1 ring-purple-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-pressed={isSelected}
                >
                  #{t.name}
                </button>
              )
            })}
          </div>
        )}
        {tagErrors.length > 0 && (
          <p className="mt-1.5 text-xs text-rose-400">{tagErrors.join(' ')}</p>
        )}
      </div>
    </div>
  )
}
