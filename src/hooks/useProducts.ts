import { useCallback, useEffect, useState } from 'react'
import type { Product } from '@/types'
import { api } from '@/lib/api'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      setError('')
      setProducts(await api.getProducts())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška pri učitavanju artikala.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    const created = await api.addProduct(p)
    setProducts((prev) => [created, ...prev])
  }, [])

  const updateProduct = useCallback(
    async (id: string, patch: Partial<Product>) => {
      const updated = await api.updateProduct(id, patch)
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    },
    [],
  )

  const removeProduct = useCallback(async (id: string) => {
    await api.deleteProduct(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { products, loading, error, addProduct, updateProduct, removeProduct }
}
