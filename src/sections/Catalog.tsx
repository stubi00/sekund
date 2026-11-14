import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProductCard from '@/sections/ProductCard'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  isAdmin: boolean
  onAdd: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onNewProduct: () => void
  onView: (p: Product) => void
}

export default function Catalog({
  products,
  isAdmin,
  onAdd,
  onEdit,
  onDelete,
  onNewProduct,
  onView,
}: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('Sve')

  const categories = useMemo(
    () => ['Sve', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) =>
        (category === 'Sve' || p.category === category) &&
        (q === '' ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)),
    )
  }, [products, query, category])

  return (
    <section id="katalog" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
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
      </div>

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
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                category === c
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border bg-card hover:border-accent hover:text-accent'
              }`}
            >
              {c}
            </button>
          ))}
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
                setCategory('Sve')
              }}
            >
              Poništi pretragu
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              isAdmin={isAdmin}
              index={i}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </section>
  )
}
