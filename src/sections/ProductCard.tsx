import { Pencil, Trash2, ShoppingBasket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { Product } from '@/types'
import { formatRsd } from '@/lib/format'

interface Props {
  product: Product
  isAdmin: boolean
  index?: number
  onAdd: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
  onView: (p: Product) => void
}

export default function ProductCard({
  product,
  isAdmin,
  index = 0,
  onAdd,
  onEdit,
  onDelete,
  onView,
}: Props) {
  const primaryImage = product.images?.[0] || product.imageUrl
  return (
    <Card
      className="card-enter card-modern group flex flex-col overflow-hidden rounded-xl hover:-translate-y-1"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div
        className="relative flex h-44 cursor-pointer items-center justify-center overflow-hidden"
        style={{ backgroundColor: product.color }}
        onClick={() => onView(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onView(product)}
        aria-label={`Detalji: ${product.name}`}
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="product-img h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            className="font-display text-6xl font-bold text-white/90"
            aria-hidden
          >
            {product.name.charAt(0)}
          </span>
        )}
        <span className="card-view-hint absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/55 to-transparent pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-white">
          Pogledaj artikal
        </span>
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge className="bg-background/90 text-foreground shadow-sm hover:bg-background/90">
            {product.category}
          </Badge>
          {product.size && (
            <Badge className="bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary/90">
              {product.size}
            </Badge>
          )}
        </div>
        {isAdmin && (
          <div className="absolute right-2 top-2 flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(product)
              }}
              aria-label={`Izmeni ${product.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(product)
              }}
              aria-label={`Obriši ${product.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <CardContent
        className="flex flex-1 cursor-pointer flex-col gap-1 p-4"
        onClick={() => onView(product)}
      >
        <h3 className="font-display text-lg font-semibold leading-snug">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <span className="font-display text-xl font-bold text-primary">
          {formatRsd(product.price)}
        </span>
        <Button size="sm" className="btn-lift" onClick={() => onAdd(product)}>
          <ShoppingBasket className="mr-1 h-4 w-4" /> U korpu
        </Button>
      </CardFooter>
    </Card>
  )
}
