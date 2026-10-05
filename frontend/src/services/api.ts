import type { DailySummary, NewSale, Product, ProductInput, Sale, SaleSummary, User } from '../types'

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
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getToken()

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

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

export function getAdminProducts(search = '', signal?: AbortSignal) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''

  return request<Product[]>(`/admin/products${query}`, { signal })
}

export function createProduct(product: ProductInput) {
  return request<Product>('/admin/products', { method: 'POST', body: JSON.stringify(product) })
}

export function updateProduct(id: number, changes: Partial<ProductInput>) {
  return request<Product>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
}

export function adjustStock(id: number, quantity: number) {
  return request<Product>(`/admin/products/${id}/stock`, { method: 'POST', body: JSON.stringify({ quantity }) })
}

export function uploadProductImage(id: number, file: File) {
  const body = new FormData()
  body.append('image', file)

  return request<Product>(`/admin/products/${id}/image`, { method: 'POST', body })
}

export function setProductImageUrl(id: number, imageUrl: string) {
  return request<Product>(`/admin/products/${id}/image`, { method: 'POST', body: JSON.stringify({ image_url: imageUrl }) })
}

export function removeProductImage(id: number) {
  return request<Product>(`/admin/products/${id}/image`, { method: 'DELETE' })
}

export function getSales(date: string) {
  return request<SaleSummary[]>(`/sales?date=${date}`)
}

export function getDailySummary(date: string) {
  return request<DailySummary>(`/sales/summary?date=${date}`)
}

export function getSale(id: number) {
  return request<Sale>(`/sales/${id}`)
}

export function createSale(sale: NewSale) {
  return request<Sale>('/sales', { method: 'POST', body: JSON.stringify(sale) })
}
