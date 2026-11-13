import '../App.css'
import { useCallback, useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Header from '@/sections/Header'
import Hero from '@/sections/Hero'
import Catalog from '@/sections/Catalog'
import CartSheet from '@/sections/CartSheet'
import AdminLogin from '@/sections/AdminLogin'
import ProductForm from '@/sections/ProductForm'
import OrdersDialog from '@/sections/OrdersDialog'
import Footer from '@/sections/Footer'
import { useProducts } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { api, clearToken, getToken } from '@/lib/api'
import type { Order, Product } from '@/types'

export default function Home() {
  const { products, loading, error, addProduct, updateProduct, removeProduct } =
    useProducts()
  const cart = useCart()

  const [orders, setOrders] = useState<Order[]>([])
  const [isAdmin, setIsAdmin] = useState(() => getToken() !== null)
  const [cartOpen, setCartOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await api.getOrders())
    } catch {
      /* token možda istekao — prikaži prazno */
      setOrders([])
    }
  }, [])

  useEffect(() => {
    if (isAdmin) loadOrders()
  }, [isAdmin, ordersOpen, loadOrders])

  const handleCheckout = async (
    order: Omit<Order, 'id' | 'createdAt'>,
  ): Promise<boolean> => {
    try {
      await api.createOrder(order)
      cart.clear()
      return true
    } catch {
      return false
    }
  }

  const handleSaveProduct = async (data: Omit<Product, 'id'>, id?: string) => {
    try {
      if (id) await updateProduct(id, data)
      else await addProduct(data)
    } finally {
      setFormOpen(false)
      setEditing(null)
    }
  }

  const handleDeleteOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
    try {
      await api.deleteOrder(id)
    } catch {
      /* ignoriši */
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Header
        cartCount={cart.count}
        isAdmin={isAdmin}
        onCartOpen={() => setCartOpen(true)}
        onAdminClick={() => setLoginOpen(true)}
        onAdminLogout={() => {
          clearToken()
          setIsAdmin(false)
          setOrders([])
        }}
      />

      <main className="flex-1">
        <Hero />

        {isAdmin && (
          <div className="border-b border-border bg-secondary/60">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm font-medium">
                Ulogovan si kao administrator — klikni olovku na kartici da
                izmeniš cenu ili detalje.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrdersOpen(true)}
              >
                <ClipboardList className="mr-1 h-4 w-4" /> Porudžbine (
                {orders.length})
              </Button>
            </div>
          </div>
        )}

        {error ? (
          <div className="mx-auto max-w-6xl px-4 py-16 text-center">
            <p className="text-lg font-medium text-destructive">
              Server nije dostupan.
            </p>
            <p className="mt-2 text-muted-foreground">
              Pokreni backend (npm run dev) pa osveži stranicu.
            </p>
          </div>
        ) : loading ? (
          <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
            Učitavam katalog…
          </div>
        ) : (
          <Catalog
            products={products}
            isAdmin={isAdmin}
            onAdd={(p) => {
              cart.add(p)
              setCartOpen(true)
            }}
            onEdit={(p) => {
              setEditing(p)
              setFormOpen(true)
            }}
            onDelete={setDeleting}
            onNewProduct={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          />
        )}
      </main>

      <Footer />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart.items}
        total={cart.total}
        setQty={cart.setQty}
        remove={cart.remove}
        onCheckout={handleCheckout}
      />

      <AdminLogin
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={() => {
          setIsAdmin(true)
          setLoginOpen(false)
        }}
      />

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSave={handleSaveProduct}
      />

      <OrdersDialog
        open={ordersOpen}
        onOpenChange={setOrdersOpen}
        orders={orders}
        onDelete={handleDeleteOrder}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati artikal?</AlertDialogTitle>
            <AlertDialogDescription>
              „{deleting?.name}" će biti trajno uklonjen iz kataloga.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleting) await removeProduct(deleting.id)
                setDeleting(null)
              }}
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
