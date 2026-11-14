import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Lock, ShoppingBasket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { useSharedCart } from '@/lib/cart-context'
import { formatRsd } from '@/lib/format'

export default function Checkout() {
  const cart = useSharedCart()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Popuni ime, telefon, adresu i grad — sve je obavezno.')
      return
    }
    setSending(true)
    setError('')
    try {
      await api.createOrder({
        customer: customer.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        note: note.trim(),
        payment: 'pouzece',
        items: cart.items.map((i) => ({
          name: i.product.size
            ? `${i.product.name} (vel. ${i.product.size})`
            : i.product.name,
          price: i.product.price,
          qty: i.qty,
        })),
        total: cart.total,
      })
      setDone(true)
      cart.clear()
    } catch {
      setError('Porudžbina nije poslata — proveri vezu pa pokušaj ponovo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Sekund" className="h-9 w-9" />
            <span className="font-display text-xl font-bold">Sekund</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Nazad na katalog
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {done ? (
          <div className="card-enter mx-auto flex max-w-md flex-col items-center gap-5 py-20 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <svg
                className="h-12 w-12"
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
            <h1 className="font-display text-3xl font-bold">
              Porudžbina primljena!
            </h1>
            <p className="text-muted-foreground">
              Hvala, {customer.split(' ')[0] || 'prijatelju'}! Zabeležili smo
              tvoju porudžbinu i kontaktiraćemo te na {phone} radi potvrde i
              dostave. Plaćaš pouzećem pri preuzimanju.
            </p>
            <Button size="lg" className="btn-lift" onClick={() => navigate('/')}>
              Nazad na početnu
            </Button>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-20 text-center">
            <ShoppingBasket className="h-16 w-16 text-muted-foreground/50" />
            <h1 className="font-display text-2xl font-bold">
              Korpa je prazna
            </h1>
            <p className="text-muted-foreground">
              Dodaj nešto iz kataloga pa se vrati da završiš porudžbinu.
            </p>
            <Button size="lg" className="btn-lift" onClick={() => navigate('/')}>
              Pogledaj katalog
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Poslednji korak
            </p>
            <h1 className="mb-8 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Završi porudžbinu
            </h1>

            <form
              onSubmit={submit}
              className="grid gap-10 lg:grid-cols-[1.2fr_1fr]"
            >
              <div className="space-y-5">
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
                <div className="grid gap-5 sm:grid-cols-2">
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

                <div className="space-y-3 pt-2">
                  <Label>Način plaćanja</Label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4">
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
                  <label className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-border p-4 opacity-60">
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

                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
              </div>

              <aside className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
                <h2 className="mb-4 font-display text-xl font-semibold">
                  Tvoja porudžbina
                </h2>
                <div className="space-y-3">
                  {cart.items.map((i) => (
                    <div key={i.product.id} className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md font-display font-bold text-white/90"
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
                        <p className="truncate text-sm font-medium">
                          {i.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {i.product.size ? `Vel. ${i.product.size} · ` : ''}
                          {i.qty} × {formatRsd(i.product.price)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatRsd(i.qty * i.product.price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Dostava</span>
                    <span>Dogovor pri potvrdi</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Ukupno</span>
                    <span className="font-display text-2xl font-bold text-primary">
                      {formatRsd(cart.total)}
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="btn-lift mt-6 w-full"
                  disabled={sending}
                >
                  {sending ? 'Šaljem porudžbinu…' : 'Potvrdi porudžbinu'}
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" /> Podaci se koriste samo za
                  dostavu.
                </p>
              </aside>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
