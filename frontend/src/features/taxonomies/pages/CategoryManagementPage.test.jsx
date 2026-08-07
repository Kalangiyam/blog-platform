import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const taxonomyMocks = vi.hoisted(() => ({
  data: {
    count: 2,
    previous: null,
    next: null,
    results: [
      { id: 1, name: 'Tech', slug: 'tech', is_active: true },
      { id: 2, name: 'Life', slug: 'life', is_active: false },
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

import CategoryManagementPage from './CategoryManagementPage.jsx'

describe('CategoryManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders categories list, active badges, and toggle action', () => {
    render(
      <MemoryRouter>
        <CategoryManagementPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /category management/i })).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('Life')).toBeInTheDocument()

    const deactivateBtn = screen.getByRole('button', { name: /deactivate/i })
    fireEvent.click(deactivateBtn)

    expect(taxonomyMocks.handleToggleActive).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Tech', is_active: true })
    )
  })
})
