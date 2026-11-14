import { useEffect, useState } from 'react'
import { ShoppingBasket, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { Product } from '@/types'
import { formatRsd } from '@/lib/format'

interface Props {
  product: Product | null
  onClose: () => void
  onAdd: (p: Product) => void
}

export default function ProductDialog({ product, onClose, onAdd }: Props) {
  const images = product
    ? product.images?.length
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : []
    : []
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
  }, [product?.id])

  if (!product) return null
  const current = images[Math.min(idx, images.length - 1)]

  return (
    <Dialog open={product !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Detalji artikla {product.name}
        </DialogDescription>

        <div className="grid md:grid-cols-2">
          {/* Galerija */}
          <div className="relative flex flex-col">
            <div
              className="relative flex aspect-square items-center justify-center overflow-hidden md:rounded-tl-lg"
              style={{ backgroundColor: product.color }}
            >
              {current ? (
                <img
                  src={current}
                  alt={`${product.name} — slika ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-8xl font-bold text-white/90">
                  {product.name.charAt(0)}
                </span>
              )}
              {images.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                    onClick={() =>
                      setIdx((i) => (i - 1 + images.length) % images.length)
                    }
                    aria-label="Prethodna slika"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                    onClick={() => setIdx((i) => (i + 1) % images.length)}
                    aria-label="Sledeća slika"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                    {idx + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((u, i) => (
                  <button
                    key={u + i}
                    onClick={() => setIdx(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                      i === idx
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    }`}
                    aria-label={`Slika ${i + 1}`}
                  >
                    <img
                      src={u}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalji */}
          <div className="flex flex-col p-6">
            <Badge className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary">
              {product.category}
            </Badge>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight">
              {product.name}
            </h2>
            <p className="mt-2 font-display text-2xl font-bold text-primary">
              {formatRsd(product.price)}
            </p>
            <p className="mt-4 flex-1 leading-relaxed text-muted-foreground">
              {product.description || 'Nema dodatnog opisa za ovaj artikal.'}
            </p>
            <div className="mt-6 space-y-2">
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  onAdd(product)
                  onClose()
                }}
              >
                <ShoppingBasket className="mr-2 h-5 w-5" /> Dodaj u korpu
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Plaćanje pouzećem · Lično preuzimanje ili dostava
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
