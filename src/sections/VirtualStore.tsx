import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ShoppingBasket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import { formatRsd } from '@/lib/format'

interface Props {
  products: Product[]
  loading?: boolean
  genders: string[]
  category: string
  gender: string
  stamp?: string
  onCategoryChange: (c: string) => void
  onGenderChange: (g: string) => void
  onView: (p: Product) => void
  onAdd: (p: Product) => void
}

/* Kuka za vešalicu */
function Hanger({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M32 15 V11 a4.5 4.5 0 1 1 4.5 -4.5" />
      <path d="M32 15 L9 34 H55 L32 15" />
    </svg>
  )
}

export default function VirtualStore({
  products,
  loading,
  genders,
  category,
  gender,
  stamp,
  onCategoryChange,
  onGenderChange,
  onView,
  onAdd,
}: Props) {
  const railRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [focused, setFocused] = useState(0)

  const categories = useMemo(
    () => ['Sve', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  )

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (gender === 'Sve' || p.gender === gender) &&
          (category === 'Sve' || p.category === category),
      ),
    [products, gender, category],
  )

  /* Coverflow — centrirani artikal je najveći */
  const update = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    const rc = rail.getBoundingClientRect()
    const center = rc.left + rc.width / 2
    let best = 0
    let bestD = Infinity
    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const d = (r.left + r.width / 2 - center) / rc.width
      const ad = Math.abs(d)
      const scale = Math.max(0.8, Math.min(1.06, 1.06 - ad * 0.6))
      el.style.transform = `scale(${scale.toFixed(3)})`
      el.style.opacity = Math.max(0.45, 1 - ad * 1.2).toFixed(3)
      el.style.zIndex = String(100 - Math.round(ad * 100))
      if (ad < bestD) {
        bestD = ad
        best = i
      }
    })
    setFocused(best)
  }, [])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      rail.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [update, filtered.length])

  /* Promena filtera — vrati štangu na početak */
  useEffect(() => {
    const rail = railRef.current
    if (rail) rail.scrollLeft = 0
    setFocused(0)
    const raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [gender, category, update])

  /* Točkić miša okreće štangu (na krajevima pusti stranicu da skroluje) */
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const canLeft = rail.scrollLeft > 0
      const canRight = rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 1
      if ((e.deltaY > 0 && canRight) || (e.deltaY < 0 && canLeft)) {
        e.preventDefault()
        rail.scrollLeft += e.deltaY
      }
    }
    rail.addEventListener('wheel', onWheel, { passive: false })
    return () => rail.removeEventListener('wheel', onWheel)
  }, [])

  /* Prevlačenje mišem */
  const dragMoved = useRef(0)
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    let dragging = false
    let startX = 0
    let startScroll = 0
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dragging = true
      dragMoved.current = 0
      startX = e.clientX
      startScroll = rail.scrollLeft
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - startX
      dragMoved.current = Math.max(dragMoved.current, Math.abs(dx))
      rail.scrollLeft = startScroll - dx
    }
    const up = () => {
      dragging = false
    }
    rail.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      rail.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])

  const scrollByItem = (dir: 1 | -1) => {
    const rail = railRef.current
    if (!rail) return
    const w = itemRefs.current[0]?.getBoundingClientRect().width ?? 240
    rail.scrollBy({ left: dir * (w + 24), behavior: 'smooth' })
  }

  const focusedProduct =
    filtered.length > 0 ? filtered[Math.min(focused, filtered.length - 1)] : null

  const skeleton = loading && products.length === 0

  return (
    <section
      id="pocetna"
      className="relative overflow-hidden border-b border-border"
    >
      <div
        className="hero-blob left-[-6rem] top-[-4rem] h-72 w-72 bg-primary/15"
        aria-hidden
      />
      <div
        className="hero-blob bottom-[-6rem] right-[10%] h-80 w-80 bg-accent/15"
        aria-hidden
      />

      {stamp && (
        <div className="stamp absolute right-6 top-14 z-20 hidden h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary px-2 text-center font-display text-[10px] font-bold uppercase leading-tight text-primary [word-break:break-word] md:flex">
          {stamp.split('\n').map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      )}

      <div className="relative mx-auto max-w-6xl px-4 pt-12 md:pt-16">
        <p className="hero-rise text-center text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Virtualna prodavnica • Obrenovac
        </p>
        <h1
          className="hero-rise mt-2 text-center font-display text-6xl font-bold tracking-tight md:text-8xl"
          style={{ animationDelay: '100ms' }}
        >
          SEKUND
        </h1>
        <p
          className="hero-rise mx-auto mt-3 max-w-[52ch] text-center text-sm text-muted-foreground md:text-base"
          style={{ animationDelay: '180ms' }}
        >
          Polovna garderoba sa pričom — zaviri na štangu, prevuci i pronađi
          nešto svoje.
        </p>
      </div>

      {/* Štanga */}
      <div className="relative mt-6 md:mt-8">
        {/* prečka */}
        <div
          className="absolute left-0 right-0 top-[13px] z-0 h-1.5 rounded-full bg-foreground/70"
          aria-hidden
        />
        <button
          className="btn-lift absolute left-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md md:flex"
          onClick={() => scrollByItem(-1)}
          aria-label="Prethodni artikal"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="btn-lift absolute right-3 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md md:flex"
          onClick={() => scrollByItem(1)}
          aria-label="Sledeći artikal"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={railRef}
          className="rack-rail relative z-10 cursor-grab select-none overflow-x-auto active:cursor-grabbing"
          onClickCapture={(e) => {
            if (dragMoved.current > 6) {
              e.preventDefault()
              e.stopPropagation()
              dragMoved.current = 0
            }
          }}
        >
          {filtered.length === 0 && !skeleton ? (
            <div className="px-4 py-20 text-center text-muted-foreground">
              Nema artikala u ovom izboru — probaj drugu kategoriju.
            </div>
          ) : (
            <div className="flex items-start gap-6 pl-[calc(50%-5.5rem)] pr-[calc(50%-5.5rem)] md:pl-[calc(50%-7rem)] md:pr-[calc(50%-7rem)]">
              {(skeleton ? Array.from({ length: 5 }) : filtered).map(
                (p, i) =>
                  skeleton || !('id' in (p as object)) ? (
                    <div
                      key={`sk-${i}`}
                      className="w-44 shrink-0 animate-pulse md:w-56"
                    >
                      <div className="mx-auto h-10 w-16" />
                      <div className="h-52 rounded-xl bg-secondary md:h-64" />
                    </div>
                  ) : (
                    <div
                      key={(p as Product).id}
                      ref={(el) => {
                        itemRefs.current[i] = el
                      }}
                      className="rack-item w-44 shrink-0 transition-transform duration-150 ease-out md:w-56"
                    >
                      <Hanger className="mx-auto -mb-1 block h-10 w-16 text-foreground/70" />
                      <button
                        className="block w-full overflow-hidden rounded-xl border border-border bg-card shadow-md transition-shadow hover:shadow-xl"
                        onClick={() => onView(p as Product)}
                        aria-label={`Detalji: ${(p as Product).name}`}
                      >
                        {((p as Product).images?.[0] ||
                          (p as Product).imageUrl) ? (
                          <img
                            src={
                              (p as Product).images?.[0] ||
                              (p as Product).imageUrl
                            }
                            alt={(p as Product).name}
                            className="h-52 w-full object-cover md:h-64"
                            draggable={false}
                            loading="lazy"
                          />
                        ) : (
                          <span
                            className="flex h-52 w-full items-center justify-center font-display text-6xl font-bold text-white/90 md:h-64"
                            style={{
                              backgroundColor: (p as Product).color,
                            }}
                            aria-hidden
                          >
                            {(p as Product).name.charAt(0)}
                          </span>
                        )}
                      </button>
                    </div>
                  ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* Natpis ispod štange — fokusirani artikal */}
      <div className="relative mx-auto flex min-h-[8.5rem] max-w-2xl flex-col items-center justify-center px-4 py-4 text-center">
        {focusedProduct && (
          <div key={focusedProduct.id} className="card-enter">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Badge variant="secondary">{focusedProduct.category}</Badge>
              {focusedProduct.gender && (
                <Badge variant="secondary">{focusedProduct.gender}</Badge>
              )}
              {focusedProduct.size && (
                <Badge variant="secondary">{focusedProduct.size}</Badge>
              )}
            </div>
            <p className="mt-2 font-display text-xl font-semibold md:text-2xl">
              {focusedProduct.name}
            </p>
            <p className="font-display text-xl font-bold text-primary md:text-2xl">
              {formatRsd(focusedProduct.price)}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="btn-lift"
                onClick={() => onView(focusedProduct)}
              >
                Detalji
              </Button>
              <Button
                size="sm"
                className="btn-lift"
                onClick={() => onAdd(focusedProduct)}
              >
                <ShoppingBasket className="mr-1 h-4 w-4" /> U korpu
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filteri — kao na snimku, dugmići na dnu */}
      <div className="relative mx-auto max-w-4xl space-y-2.5 px-4 pb-10">
        {genders.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {['Sve', ...genders].map((g) => (
              <button
                key={g}
                onClick={() => onGenderChange(g)}
                className={`btn-lift rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  gender === g
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card hover:border-primary hover:text-primary'
                }`}
              >
                {g === 'Sve' ? 'Sva odeljenja' : g}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={`btn-lift rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                  : 'border-border bg-card hover:border-accent hover:text-accent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
