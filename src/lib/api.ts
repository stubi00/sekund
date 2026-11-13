import type { Order, Product } from '@/types'

const TOKEN_KEY = 'sekund-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function login(password: string): Promise<boolean> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) return false
  const data = await res.json()
  localStorage.setItem(TOKEN_KEY, data.token)
  return true
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Greška servera (${res.status})`)
  }
  return res.json()
}

export const api = {
  getProducts: () => req<Product[]>('/api/products'),
  addProduct: (p: Omit<Product, 'id'>) =>
    req<Product>('/api/products', { method: 'POST', body: JSON.stringify(p) }),
  updateProduct: (id: string, p: Partial<Product>) =>
    req<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(p),
    }),
  deleteProduct: (id: string) =>
    req<{ ok: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),
  createOrder: (o: Omit<Order, 'id' | 'createdAt'>) =>
    req<{ ok: boolean; id: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(o),
    }),
  getOrders: () => req<Order[]>('/api/orders'),
  deleteOrder: (id: string) =>
    req<{ ok: boolean }>(`/api/orders/${id}`, { method: 'DELETE' }),
}
