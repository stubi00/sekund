import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { Order } from '@/types'
import { formatRsd } from '@/lib/format'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
  onDelete: (id: string) => void
}

export default function OrdersDialog({
  open,
  onOpenChange,
  orders,
  onDelete,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Porudžbine</DialogTitle>
          <DialogDescription>
            {orders.length === 0
              ? 'Još nema porudžbina.'
              : `${orders.length} porudžbina ukupno.`}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-lg border border-border p-4 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{o.customer}</p>
                <div className="flex items-center gap-2">
                  <p className="font-display font-bold text-primary">
                    {formatRsd(o.total)}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(o.id)}
                    aria-label={`Obriši porudžbinu od ${o.customer}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground">
                {o.phone} · {o.address}, {o.city}
              </p>
              <p className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                Plaćanje pouzećem
              </p>
              <ul className="mt-2 list-inside list-disc text-muted-foreground">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    {i.qty}× {i.name} — {formatRsd(i.price * i.qty)}
                  </li>
                ))}
              </ul>
              {o.note && (
                <p className="mt-2 italic text-muted-foreground">„{o.note}"</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString('sr-RS')}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
