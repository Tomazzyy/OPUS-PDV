import { useEffect, useState } from 'react'
import { getDailySummary, getSales } from '../services/api'
import type { DailySummary, SaleSummary } from '../types'

type Result = {
  key: string
  sales: SaleSummary[]
  summary: DailySummary | null
  error: boolean
}

export function useDailySales(date: string) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const key = `${date}:${attempt}`

  useEffect(() => {
    let ignore = false

    Promise.all([getSales(date), getDailySummary(date)])
      .then(([sales, summary]) => !ignore && setResult({ key, sales, summary, error: false }))
      .catch(() => !ignore && setResult({ key, sales: [], summary: null, error: true }))

    return () => {
      ignore = true
    }
  }, [date, key])

  return {
    sales: result?.sales ?? [],
    summary: result?.summary ?? null,
    loading: result?.key !== key,
    error: result?.key === key && result.error,
    retry: () => setAttempt((value) => value + 1),
  }
}
