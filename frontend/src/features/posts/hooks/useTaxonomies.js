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

        const [catData, tagData] = await Promise.all([
          getCategories({ signal: controller.signal }),
          getTags({ signal: controller.signal }),
        ])

        if (isSubscribed) {
          setCategories(Array.isArray(catData?.results) ? catData.results : Array.isArray(catData) ? catData : [])
          setTags(Array.isArray(tagData?.results) ? tagData.results : Array.isArray(tagData) ? tagData : [])
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
