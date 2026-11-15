import { useEffect, useState } from 'react'
import {
  ShoppingBasket,
  Lock,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

interface Props {
  cartCount: number
  isAdmin: boolean
  genders: string[]
  categories: string[]
  onPick: (gender: string, category: string | null) => void
  onCartOpen: () => void
  onAdminClick: () => void
  onAdminLogout: () => void
}

export default function Header({
  cartCount,
  isAdmin,
  genders,
  categories,
  onPick,
  onCartOpen,
  onAdminClick,
  onAdminLogout,
}: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedGender, setExpandedGender] = useState<string | null>(null)

  const pickMobile = (gender: string, category: string | null) => {
    setMobileOpen(false)
    setExpandedGender(null)
    onPick(gender, category)
  }

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
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 py-2 transition-colors hover:text-primary"
              aria-haspopup="true"
            >
              Prodavnica <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute left-0 top-full pt-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="w-44 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                {genders.map((g) => (
                  <div key={g} className="group/sub relative">
                    <button
                      type="button"
                      onClick={() => onPick(g, null)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                    >
                      {g}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <div className="invisible absolute left-full top-0 pl-1.5 opacity-0 transition-all duration-150 group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100">
                      <div className="w-44 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                        <button
                          type="button"
                          onClick={() => onPick(g, null)}
                          className="w-full rounded-lg px-3 py-2 text-left font-semibold transition-colors hover:bg-secondary"
                        >
                          Sve — {g.toLowerCase()}
                        </button>
                        {categories.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => onPick(g, c)}
                            className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Link to="/kontakt" className="transition-colors hover:text-primary">
            Kontakt
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Zatvori meni' : 'Otvori meni'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
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

      {mobileOpen && (
        <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 text-sm font-medium">
            <a
              href="#pocetna"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
            >
              Početna
            </a>
            <Link
              to="/kontakt"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
            >
              Kontakt
            </Link>

            <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prodavnica
            </p>
            {genders.map((g) => (
              <div key={g}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedGender(expandedGender === g ? null : g)
                  }
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary"
                  aria-expanded={expandedGender === g}
                >
                  {g}
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${expandedGender === g ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedGender === g && (
                  <div className="ml-3 space-y-0.5 border-l-2 border-border pl-3">
                    <button
                      type="button"
                      onClick={() => pickMobile(g, null)}
                      className="block w-full rounded-lg px-3 py-2 text-left font-semibold transition-colors hover:bg-secondary"
                    >
                      Sve — {g.toLowerCase()}
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => pickMobile(g, c)}
                        className="block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </div>
        </nav>
      )}
    </header>
  )
}
