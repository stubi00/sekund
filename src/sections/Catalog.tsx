import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProductCard from '@/sections/ProductCard'
import Reveal from '@/components/Reveal'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  isAdmin: boolean
  genders: string[]
  category: string
  gender: string
  onCategoryChange: (c: string) => void
  onGenderChange: (g: string) => void
  onAdd: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onNewProduct: () => void
  onView: (p: Product) => void
}

export default function Catalog({
  products,
  isAdmin,
  genders,
  category,
  gender,
  onCategoryChange,
  onGenderChange,
  onAdd,
  onEdit,
  onDelete,
  onNewProduct,
  onView,
}: Props) {
  const [query, setQuery] = useState('')
  const [size, setSize] = useState<string>('Sve')
  const [sort, setSort] = useState<'default' | 'asc' | 'desc'>('default')

  const categories = useMemo(
    () => ['Sve', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  )

  const sizes = useMemo(
    () => [
      'Sve',
      ...Array.from(
        new Set(products.map((p) => p.size).filter((s): s is string => !!s)),
      ),
    ],
    [products],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter(
      (p) =>
        (gender === 'Sve' || p.gender === gender) &&
        (category === 'Sve' || p.category === category) &&
        (size === 'Sve' || p.size === size) &&
        (q === '' ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)),
    )
    if (sort === 'asc') return [...list].sort((a, b) => a.price - b.price)
    if (sort === 'desc') return [...list].sort((a, b) => b.price - a.price)
    return list
  }, [products, query, category, gender, size, sort])

  return (
    <section id="katalog" className="mx-auto max-w-6xl px-4 py-16">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Ponuda
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Katalog
          </h2>
          <p className="mt-1 text-muted-foreground">
            {products.length} artikala u ponudi
          </p>
        </div>
        {isAdmin && (
          <Button onClick={onNewProduct}>
            <Plus className="mr-1 h-4 w-4" /> Dodaj artikal
          </Button>
        )}
      </Reveal>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Pretraži artikle…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Pretraga artikala"
          />
        </div>
        {genders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {['Sve', ...genders].map((g) => (
              <button
                key={g}
                onClick={() => onGenderChange(g)}
                className={`btn-lift rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
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
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={`btn-lift rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                  : 'border-border bg-card hover:border-accent hover:text-accent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sizes.length > 1 && (
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:border-accent focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Filter po veličini"
            >
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s === 'Sve' ? 'Sve veličine' : `Veličina ${s}`}
                </option>
              ))}
            </select>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'default' | 'asc' | 'desc')}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:border-accent focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Sortiranje"
          >
            <option value="default">Podrazumevano</option>
            <option value="asc">Cena: od najniže</option>
            <option value="desc">Cena: od najviše</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          Nema artikala za prikaz.{' '}
          {query && (
            <button
              className="font-medium text-primary underline underline-offset-4"
              onClick={() => {
                setQuery('')
                onCategoryChange('Sve')
                onGenderChange('Sve')
                setSize('Sve')
                setSort('default')
              }}
            >
              Poništi pretragu
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i % 4, 3) * 70}>
              <ProductCard
                product={p}
                isAdmin={isAdmin}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}
