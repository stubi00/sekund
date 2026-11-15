import '../App.css'
import { useCallback, useEffect, useState } from 'react'
import { ClipboardList, LayoutPanelTop } from 'lucide-react'
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
import Room3D from '@/sections/Room3D'
import Catalog from '@/sections/Catalog'
import CartSheet from '@/sections/CartSheet'
import AdminLogin from '@/sections/AdminLogin'
import ProductForm from '@/sections/ProductForm'
import OrdersDialog from '@/sections/OrdersDialog'
import HeroForm from '@/sections/HeroForm'
import ProductDialog from '@/sections/ProductDialog'
import Footer from '@/sections/Footer'
import { useNavigate } from 'react-router'
import { useProducts } from '@/hooks/useProducts'
import { useSharedCart } from '@/lib/cart-context'
import { api, clearToken, getToken } from '@/lib/api'
import type { Order, Product, SiteSettings } from '@/types'

export default function Home() {
  const navigate = useNavigate()
  const { products, loading, error, addProduct, updateProduct, removeProduct } =
    useProducts()
  const cart = useSharedCart()

  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isAdmin, setIsAdmin] = useState(() => getToken() !== null)
  const [cartOpen, setCartOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [heroFormOpen, setHeroFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [viewing, setViewing] = useState<Product | null>(null)
  const [filterGender, setFilterGender] = useState('Sve')
  const [filterCategory, setFilterCategory] = useState('Sve')

  const genders = settings?.genders?.length
    ? settings.genders
    : ['Muško', 'Žensko']
  const categories = Array.from(new Set(products.map((p) => p.category)))

  const handlePick = (gender: string, category: string | null) => {
    setFilterGender(gender)
    setFilterCategory(category ?? 'Sve')
    document
      .getElementById('katalog')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    api
      .getSettings()
      .then(setSettings)
      .catch(() => setSettings(null))
  }, [])

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
        genders={genders}
        categories={categories}
        onPick={handlePick}
        onCartOpen={() => setCartOpen(true)}
        onAdminClick={() => setLoginOpen(true)}
        onAdminLogout={() => {
          clearToken()
          setIsAdmin(false)
          setOrders([])
        }}
      />

      <main className="flex-1">
        <Room3D
          products={products}
          loading={loading}
          genders={genders}
          category={filterCategory}
          gender={filterGender}
          stamp={settings?.stamp}
          onCategoryChange={setFilterCategory}
          onGenderChange={setFilterGender}
          onView={setViewing}
          onAdd={(p) => {
            cart.add(p)
            setCartOpen(true)
          }}
        />

        {isAdmin && (
          <div className="border-b border-border bg-secondary/60">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm font-medium">
                Ulogovan si kao administrator — klikni olovku na kartici da
                izmeniš cenu ili detalje.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHeroFormOpen(true)}
                >
                  <LayoutPanelTop className="mr-1 h-4 w-4" /> Uredi početnu
                </Button>
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
            genders={genders}
            category={filterCategory}
            gender={filterGender}
            onCategoryChange={setFilterCategory}
            onGenderChange={setFilterGender}
            onAdd={(p) => {
              cart.add(p)
              setCartOpen(true)
            }}
            onEdit={(p) => {
              setEditing(p)
              setFormOpen(true)
            }}
            onDelete={setDeleting}
            onView={setViewing}
            onNewProduct={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          />
        )}

      </main>

      <Footer />

      <ProductDialog
        product={viewing}
        onClose={() => setViewing(null)}
        onAdd={(p) => {
          cart.add(p)
          setCartOpen(true)
        }}
      />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart.items}
        total={cart.total}
        setQty={cart.setQty}
        remove={cart.remove}
        onGoCheckout={() => {
          setCartOpen(false)
          navigate('/porudzbina')
        }}
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
        genders={genders}
        onSave={handleSaveProduct}
      />

      <OrdersDialog
        open={ordersOpen}
        onOpenChange={setOrdersOpen}
        orders={orders}
        onDelete={handleDeleteOrder}
      />

      {settings && (
        <HeroForm
          open={heroFormOpen}
          onOpenChange={setHeroFormOpen}
          settings={settings}
          onSave={async (s) => {
            const saved = await api.updateSettings(s)
            setSettings(saved)
          }}
        />
      )}

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
