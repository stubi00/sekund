import { createContext, useContext, type ReactNode } from 'react'
import { useCart } from '@/hooks/useCart'

type CartApi = ReturnType<typeof useCart>

const CartContext = createContext<CartApi | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart()
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>
}

export function useSharedCart(): CartApi {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useSharedCart mora biti unutar CartProvider-a')
  return ctx
}
