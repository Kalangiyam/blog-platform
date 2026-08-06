import { matchRoutes } from 'react-router'
import { describe, expect, it } from 'vitest'

import PostDetailPage from '../features/posts/pages/PostDetailPage.jsx'
import PostListPage from '../features/posts/pages/PostListPage.jsx'
import { router } from './router.jsx'

describe('public post routing', () => {
  it('matches the public list route to PostListPage', () => {
    const matches = matchRoutes(router.routes, '/posts')
    expect(matches.at(-1).route.element.type).toBe(PostListPage)
  })

  it('matches a slug route to PostDetailPage and extracts the slug', () => {
    const matches = matchRoutes(router.routes, '/posts/architecture-first')
    expect(matches.at(-1).route.element.type).toBe(PostDetailPage)
    expect(matches.at(-1).params.postSlug).toBe('architecture-first')
  })
})
