import { useState } from 'react'

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
  const [catSearch, setCatSearch] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false)
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)

  const toggleCategory = (slug) => {
    if (disabled) return
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug]
    if (onCategoryChange) onCategoryChange(next)
  }

  const removeCategory = (slug) => {
    if (disabled) return
    if (onCategoryChange) {
      onCategoryChange(selectedCategories.filter((s) => s !== slug))
    }
  }

  const toggleTag = (slug) => {
    if (disabled) return
    const next = selectedTags.includes(slug)
      ? selectedTags.filter((s) => s !== slug)
      : [...selectedTags, slug]
    if (onTagChange) onTagChange(next)
  }

  const removeTag = (slug) => {
    if (disabled) return
    if (onTagChange) {
      onTagChange(selectedTags.filter((s) => s !== slug))
    }
  }

  const filteredCategories = availableCategories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase().trim()),
  )

  const filteredTags = availableTags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase().trim()),
  )

  const selectedCategoryObjects = availableCategories.filter((c) =>
    selectedCategories.includes(c.slug),
  )

  const selectedTagObjects = availableTags.filter((t) =>
    selectedTags.includes(t.slug),
  )

  return (
    <div className="space-y-6">
      {/* Categories Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-0.5">
            Categories
          </h3>
          <p className="text-xs text-slate-500">
            Select one or more categories that best describe your post.
          </p>
        </div>

        {/* Searchable Select Input */}
        <div className="relative">
          <div className="relative">
            <input
              aria-label="Search categories"
              type="text"
              placeholder="Search and select categories..."
              value={catSearch}
              onChange={(e) => {
                setCatSearch(e.target.value)
                setIsCatDropdownOpen(true)
              }}
              onFocus={() => setIsCatDropdownOpen(true)}
              disabled={disabled}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors pr-9"
            />
            <button
              aria-expanded={isCatDropdownOpen}
              aria-label="Toggle category options"
              disabled={disabled}
              type="button"
              tabIndex={-1}
              onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isCatDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Dropdown Options */}
          {isCatDropdownOpen && (
            <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-in fade-in zoom-in-95 duration-100">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.slug)
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        toggleCategory(cat.slug)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })
              ) : (
                <p className="p-3 text-xs text-slate-400 italic">No matching categories found.</p>
              )}
            </div>
          )}
        </div>

        {/* Selected Category Chips */}
        <div>
          {selectedCategoryObjects.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedCategoryObjects.map((cat) => (
                <span
                  key={cat.slug}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
                >
                  {cat.name}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeCategory(cat.slug)}
                    className="hover:bg-indigo-100 rounded-full p-0.5 text-indigo-500 hover:text-indigo-800 transition-colors cursor-pointer"
                    aria-label={`Remove ${cat.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No categories selected</p>
          )}
        </div>

        {categoryErrors?.length > 0 && (
          <p className="text-xs font-medium text-rose-500">{categoryErrors.join(' ')}</p>
        )}
      </div>

      {/* Tags Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-0.5">
            Tags
          </h3>
          <p className="text-xs text-slate-500">
            Add relevant tags to help readers find your post.
          </p>
        </div>

        {/* Searchable Select Input */}
        <div className="relative">
          <div className="relative">
            <input
              aria-label="Search tags"
              type="text"
              placeholder="Search or select tags..."
              value={tagSearch}
              onChange={(e) => {
                setTagSearch(e.target.value)
                setIsTagDropdownOpen(true)
              }}
              onFocus={() => setIsTagDropdownOpen(true)}
              disabled={disabled}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors pr-9"
            />
            <button
              aria-expanded={isTagDropdownOpen}
              aria-label="Toggle tag options"
              disabled={disabled}
              type="button"
              tabIndex={-1}
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isTagDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Dropdown Options */}
          {isTagDropdownOpen && (
            <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-in fade-in zoom-in-95 duration-100">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.slug)
                  return (
                    <button
                      key={tag.slug}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        toggleTag(tag.slug)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>#{tag.name}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })
              ) : (
                <p className="p-3 text-xs text-slate-400 italic">No matching tags found.</p>
              )}
            </div>
          )}
        </div>

        {/* Selected Tag Chips */}
        <div>
          {selectedTagObjects.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedTagObjects.map((tag) => (
                <span
                  key={tag.slug}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white border border-slate-800 shadow-2xs"
                >
                  #{tag.name}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeTag(tag.slug)}
                    className="hover:bg-slate-700 rounded-full p-0.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    aria-label={`Remove ${tag.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No tags selected</p>
          )}
        </div>

        {tagErrors?.length > 0 && (
          <p className="text-xs font-medium text-rose-500">{tagErrors.join(' ')}</p>
        )}
      </div>
    </div>
  )
}
