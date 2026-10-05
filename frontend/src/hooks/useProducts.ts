import { useEffect, useState } from 'react'
import { getProducts } from '../services/api'
import type { Product } from '../types'

const SEARCH_DELAY_MS = 300

export function useProducts(search: string, loadProducts = getProducts) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(
      () => {
        setLoading(true)
        setError(false)

        loadProducts(search.trim(), controller.signal)
          .then(setProducts)
          .catch(() => {
            if (!controller.signal.aborted) {
              setError(true)
            }
          })
          .finally(() => {
            if (!controller.signal.aborted) {
              setLoading(false)
            }
          })
      },
      search ? SEARCH_DELAY_MS : 0,
    )

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, attempt, loadProducts])

  return { products, loading, error, retry: () => setAttempt((value) => value + 1) }
}
