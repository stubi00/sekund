import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { CartItem } from '@/types'
import { formatRsd } from '@/lib/format'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  total: number
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  onGoCheckout: () => void
}

export default function CartSheet({
  open,
  onOpenChange,
  items,
  total,
  setQty,
  remove,
  onGoCheckout,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Tvoja korpa</SheetTitle>
          <SheetDescription>
            {items.length} različitih artikala
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
          {items.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Korpa je prazna. Baci pogled na katalog.
            </p>
          ) : (
            items.map((i) => (
              <div
                key={i.product.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md font-display text-lg font-bold text-white/90"
                  style={{ backgroundColor: i.product.color }}
                  aria-hidden
                >
                  {i.product.images?.[0] || i.product.imageUrl ? (
                    <img
                      src={i.product.images?.[0] || i.product.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    i.product.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{i.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {i.product.size ? `Vel. ${i.product.size} · ` : ''}
                    {formatRsd(i.product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => setQty(i.product.id, i.qty - 1)}
                    aria-label="Smanji količinu"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold">
                    {i.qty}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => setQty(i.product.id, i.qty + 1)}
                    aria-label="Povećaj količinu"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(i.product.id)}
                  aria-label={`Ukloni ${i.product.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-muted-foreground">Ukupno</span>
              <span className="font-display text-2xl font-bold text-primary">
                {formatRsd(total)}
              </span>
            </div>
            <Button
              className="btn-lift w-full"
              size="lg"
              onClick={onGoCheckout}
            >
              Nastavi na porudžbinu
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
