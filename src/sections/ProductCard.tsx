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
}

export default function ProductCard({
  product,
  isAdmin,
  index = 0,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Card
      className="card-enter group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div
        className="relative flex h-40 items-center justify-center overflow-hidden"
        style={{ backgroundColor: product.color }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
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
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background/90">
          {product.category}
        </Badge>
        {isAdmin && (
          <div className="absolute right-2 top-2 flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={() => onEdit(product)}
              aria-label={`Izmeni ${product.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={() => onDelete(product)}
              aria-label={`Obriši ${product.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1 p-4">
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
        <Button size="sm" onClick={() => onAdd(product)}>
          <ShoppingBasket className="mr-1 h-4 w-4" /> U korpu
        </Button>
      </CardFooter>
    </Card>
  )
}
