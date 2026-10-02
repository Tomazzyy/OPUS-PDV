import type { NewSale, Product, Sale, User } from '../types'

const TOKEN_KEY = 'opuspdv_token'

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
  const token = getToken()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response

  try {
    response = await fetch(`/api${path}`, { ...options, headers })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError('Não foi possível conectar ao servidor.', 0)
  }

  const body = await response.json().catch(() => null)

  if (response.status === 401 && token) {
    setToken(null)
    onUnauthorized()
  }

  if (!response.ok) {
    throw new ApiError(body?.message ?? 'Ocorreu um erro inesperado.', response.status, body?.errors)
  }

  return body?.data
}

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logout() {
  return request<void>('/logout', { method: 'POST' })
}

export function getMe() {
  return request<User>('/me')
}

export function getProducts(search = '', signal?: AbortSignal) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''

  return request<Product[]>(`/products${query}`, { signal })
}

export function getSale(id: number) {
  return request<Sale>(`/sales/${id}`)
}

export function createSale(sale: NewSale) {
  return request<Sale>('/sales', { method: 'POST', body: JSON.stringify(sale) })
}
