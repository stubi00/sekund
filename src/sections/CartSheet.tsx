import { useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { CartItem, Order } from '@/types'
import { formatRsd } from '@/lib/format'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  total: number
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  onCheckout: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<boolean>
}

export default function CartSheet({
  open,
  onOpenChange,
  items,
  total,
  setQty,
  remove,
  onCheckout,
}: Props) {
  const [step, setStep] = useState<'cart' | 'form' | 'done'>('cart')
  const [customer, setCustomer] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const close = (o: boolean) => {
    onOpenChange(o)
    if (!o) {
      setStep('cart')
      setError('')
    }
  }

  const [sending, setSending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !customer.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim()
    ) {
      setError('Popuni ime, telefon, adresu i grad — sve je obavezno.')
      return
    }
    setSending(true)
    setError('')
    const ok = await onCheckout({
      customer: customer.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      note: note.trim(),
      payment: 'pouzece',
      items: items.map((i) => ({
        name: i.product.name,
        price: i.product.price,
        qty: i.qty,
      })),
      total,
    })
    setSending(false)
    if (ok) {
      setStep('done')
    } else {
      setError('Porudžbina nije poslata — proveri vezu pa pokušaj ponovo.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">
            {step === 'cart' && 'Tvoja korpa'}
            {step === 'form' && 'Podaci za dostavu'}
            {step === 'done' && 'Porudžbina primljena'}
          </SheetTitle>
          <SheetDescription>
            {step === 'cart' && `${items.length} različitih artikala`}
            {step === 'form' && 'Plaćanje pouzećem pri preuzimanju.'}
            {step === 'done' && 'Javljamo ti se uskoro radi potvrde.'}
          </SheetDescription>
        </SheetHeader>

        {step === 'cart' && (
          <>
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
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md font-display text-lg font-bold text-white/90"
                      style={{ backgroundColor: i.product.color }}
                      aria-hidden
                    >
                      {i.product.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{i.product.name}</p>
                      <p className="text-sm text-muted-foreground">
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
                <Button className="w-full" size="lg" onClick={() => setStep('form')}>
                  Nastavi na porudžbinu
                </Button>
              </div>
            )}
          </>
        )}

        {step === 'form' && (
          <form onSubmit={submit} className="mt-4 flex flex-1 flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">Ime i prezime *</Label>
              <Input
                id="c-name"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="npr. Milica Jovanović"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">Telefon *</Label>
              <Input
                id="c-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="npr. 064 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-address">Adresa *</Label>
              <Input
                id="c-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ulica i broj"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-city">Grad i poštanski broj *</Label>
              <Input
                id="c-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="npr. 11500 Obrenovac"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-note">Napomena</Label>
              <Textarea
                id="c-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Opciono — npr. termin dostave"
              />
            </div>
            <div className="space-y-2">
              <Label>Način plaćanja</Label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-primary bg-primary/5 p-3">
                  <input
                    type="radio"
                    name="payment"
                    defaultChecked
                    className="mt-1 h-4 w-4 accent-[#c1502e]"
                  />
                  <span>
                    <span className="block font-semibold">
                      Plaćanje pouzećem
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Plaćaš kuriru pri preuzimanju paketa.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-not-allowed items-start gap-3 rounded-lg border border-border p-3 opacity-60">
                  <input
                    type="radio"
                    name="payment"
                    disabled
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    <span className="block font-semibold">
                      Platnom karticom
                      <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                        uskoro
                      </span>
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Onlajn plaćanje karticom je u pripremi.
                    </span>
                  </span>
                </label>
              </div>
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <div className="mt-auto space-y-2 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ukupno</span>
                <span className="font-display text-xl font-bold text-primary">
                  {formatRsd(total)}
                </span>
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={sending}
              >
                {sending ? 'Šaljem porudžbinu…' : 'Potvrdi porudžbinu'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('cart')}
              >
                Nazad na korpu
              </Button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <svg
                className="h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="max-w-[30ch] text-muted-foreground">
              Hvala, {customer.split(' ')[0] || 'prijatelju'}! Porudžbinu smo
              zabeležili i kontaktiraćemo te na {phone}.
            </p>
            <Button className="w-full" onClick={() => close(false)}>
              Zatvori
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
