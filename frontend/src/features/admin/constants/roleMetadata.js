import { APPLICATION_ROLES } from '../../permissions/index.js'

/**
 * Presentational role configuration mapping application roles to
 * descriptions, sidebar guidance, and Tailwind visual styles.
 */
export const ROLE_METADATA = [
  {
    role: APPLICATION_ROLES.AUTHOR,
    label: 'Author',
    description: 'Can create and manage their own posts and comments.',
    sidebarDescription: 'Best for content creators who write and manage their own posts.',
    badgeColor: 'bg-purple-50 text-purple-600 border-purple-100',
    selectedBorder: 'border-purple-500 bg-purple-50/20',
  },
  {
    role: APPLICATION_ROLES.EDITOR,
    label: 'Editor',
    description: 'Can manage content, categories, tags, and moderate comments.',
    sidebarDescription: 'Best for content managers who oversee and moderate content.',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    selectedBorder: 'border-emerald-500 bg-emerald-50/20',
  },
  {
    role: APPLICATION_ROLES.ADMINISTRATOR,
    label: 'Administrator',
    description: 'Can manage users, application roles, and account access.',
    sidebarDescription: 'Best for system administrators who manage users and account access.',
    badgeColor: 'bg-rose-50 text-rose-600 border-rose-100',
    selectedBorder: 'border-rose-500 bg-rose-50/20',
  },
]
