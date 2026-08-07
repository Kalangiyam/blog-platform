import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const taxonomyMocks = vi.hoisted(() => ({
  data: {
    count: 2,
    previous: null,
    next: null,
    results: [
      { id: 1, name: 'React', slug: 'react', is_active: true },
      { id: 2, name: 'Django', slug: 'django', is_active: false },
    ],
  },
  isLoading: false,
  error: null,
  page: 1,
  isSubmitting: false,
  editingItem: null,
  setPage: vi.fn(),
  setEditingItem: vi.fn(),
  handleSave: vi.fn(),
  handleToggleActive: vi.fn(),
  retry: vi.fn(),
}))

vi.mock('../hooks/useTaxonomyManagement.js', () => ({
  useTaxonomyManagement: () => taxonomyMocks,
}))

import TagManagementPage from './TagManagementPage.jsx'

describe('TagManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders tag management page, badges, and allows active status toggle', () => {
    render(
      <MemoryRouter>
        <TagManagementPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /tag management/i })).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Django')).toBeInTheDocument()

    const activateBtn = screen.getByRole('button', { name: /^activate$/i })
    fireEvent.click(activateBtn)

    expect(taxonomyMocks.handleToggleActive).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Django', is_active: false })
    )
  })
})
