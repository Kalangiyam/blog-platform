import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CategoryTagPicker from './CategoryTagPicker.jsx'

describe('CategoryTagPicker', () => {
  const categories = [
    { name: 'Tech', slug: 'tech' },
    { name: 'Design', slug: 'design' },
  ]
  const tags = [
    { name: 'React', slug: 'react' },
    { name: 'Django', slug: 'django' },
  ]

  it('renders category and tag choices and toggles selections', () => {
    const onCategoryChange = vi.fn()
    const onTagChange = vi.fn()

    render(
      <CategoryTagPicker
        availableCategories={categories}
        selectedCategories={['tech']}
        onCategoryChange={onCategoryChange}
        availableTags={tags}
        selectedTags={[]}
        onTagChange={onTagChange}
      />,
    )

    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('#React')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Design'))
    expect(onCategoryChange).toHaveBeenCalledWith(['tech', 'design'])

    fireEvent.click(screen.getByText('#React'))
    expect(onTagChange).toHaveBeenCalledWith(['react'])
  })
})
