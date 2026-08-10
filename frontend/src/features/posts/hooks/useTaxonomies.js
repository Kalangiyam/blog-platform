import { useEffect, useState } from 'react'
import { getCategories, getTags } from '../api/postsApi.js'

export function useTaxonomies() {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    let isSubscribed = true

    async function loadTaxonomies() {
      try {
        setLoading(true)
        setError(null)

        const fetchAll = async (fetchFn) => {
          let results = []
          let page = 1
          let hasNext = true
          while (hasNext && isSubscribed) {
            const data = await fetchFn(page, { signal: controller.signal })
            if (data && data.results) {
              results = results.concat(data.results)
              hasNext = !!data.next
              page++
            } else if (Array.isArray(data)) {
              results = results.concat(data)
              hasNext = false
            } else {
              hasNext = false
            }
          }
          return results
        }

        const [catData, tagData] = await Promise.all([
          fetchAll(getCategories),
          fetchAll(getTags),
        ])

        if (isSubscribed) {
          setCategories(catData)
          setTags(tagData)
        }
      } catch (err) {
        if (isSubscribed && err?.code !== 'cancelled') {
          setError(err)
        }
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    loadTaxonomies()

    return () => {
      isSubscribed = false
      controller.abort()
    }
  }, [])

  return {
    categories,
    tags,
    loading,
    error,
  }
}
