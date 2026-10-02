import { useEffect, useState } from 'react'
import { getMe, getToken, login, logout, setToken, setUnauthorizedHandler } from '../services/api'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(() => getToken() !== null)

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null))

    if (!getToken()) {
      return
    }

    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false))
  }, [])

  async function signIn(email: string, password: string) {
    const response = await login(email, password)
    setToken(response.token)
    setUser(response.user)
  }

  async function signOut() {
    try {
      await logout()
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  return { user, checking, signIn, signOut }
}
