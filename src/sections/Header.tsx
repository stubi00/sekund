import { useEffect, useState } from 'react'
import { ShoppingBasket, Lock, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  cartCount: number
  isAdmin: boolean
  onCartOpen: () => void
  onAdminClick: () => void
  onAdminLogout: () => void
}

export default function Header({
  cartCount,
  isAdmin,
  onCartOpen,
  onAdminClick,
  onAdminLogout,
}: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur transition-shadow duration-200 ${scrolled ? 'header-scrolled' : ''}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#pocetna" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Sekund logo"
            className="h-10 w-10 rounded-full"
          />
          <span className="font-display text-2xl font-bold tracking-tight">
            Sekund
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#pocetna" className="transition-colors hover:text-primary">
            Početna
          </a>
          <a href="#katalog" className="transition-colors hover:text-primary">
            Katalog
          </a>
          <a href="#o-nama" className="transition-colors hover:text-primary">
            O nama
          </a>
          <a href="#kontakt" className="transition-colors hover:text-primary">
            Kontakt
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="hidden rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground sm:inline">
              Admin režim
            </span>
          )}
          {isAdmin ? (
            <Button variant="outline" size="sm" onClick={onAdminLogout}>
              <LogOut className="mr-1 h-4 w-4" /> Odjava
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onAdminClick}>
              <Lock className="mr-1 h-4 w-4" /> Admin
            </Button>
          )}
          <Button onClick={onCartOpen} size="sm" className="relative">
            <ShoppingBasket className="mr-1 h-4 w-4" /> Korpa
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="badge-pop absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground"
              >
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
