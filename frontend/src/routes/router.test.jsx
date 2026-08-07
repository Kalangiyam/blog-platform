import { matchRoutes } from 'react-router'
import { describe, expect, it } from 'vitest'

import PostDetailPage from '../features/posts/pages/PostDetailPage.jsx'
import PostListPage from '../features/posts/pages/PostListPage.jsx'
import { router } from './router.jsx'

describe('post routing', () => {
  it('matches the public list route to PostListPage', () => {
    const matches = matchRoutes(router.routes, '/posts')
    const route = matches.at(-1).route
    const component = route.Component || route.element.type
    expect(component).toBe(PostListPage)
  })

  it('matches a slug route to PostDetailPage and extracts the slug', () => {
    const matches = matchRoutes(router.routes, '/posts/architecture-first')
    const route = matches.at(-1).route
    const component = route.Component || route.element.type
    expect(component).toBe(PostDetailPage)
    expect(matches.at(-1).params.postSlug).toBe('architecture-first')
  })

  it('matches /posts/new route', () => {
    const matches = matchRoutes(router.routes, '/posts/new')
    expect(matches).not.toBeNull()
  })

  it('matches /posts/:postSlug/edit route', () => {
    const matches = matchRoutes(router.routes, '/posts/my-post/edit')
    expect(matches).not.toBeNull()
    expect(matches.at(-1).params.postSlug).toBe('my-post')
  })
})
