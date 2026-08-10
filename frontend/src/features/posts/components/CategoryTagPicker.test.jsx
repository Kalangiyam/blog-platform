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

    fireEvent.click(screen.getByRole('button', { name: 'Toggle category options' }))
    fireEvent.click(screen.getByRole('button', { name: 'Design' }))
    expect(onCategoryChange).toHaveBeenCalledWith(['tech', 'design'])

    fireEvent.click(screen.getByRole('button', { name: 'Toggle tag options' }))
    fireEvent.click(screen.getByRole('button', { name: '#React' }))
    expect(onTagChange).toHaveBeenCalledWith(['react'])
  })
})
