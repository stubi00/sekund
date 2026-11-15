import { Link } from 'react-router'
import { ArrowLeft, Clock, Mail, MapPin, Phone } from 'lucide-react'

export default function Kontakt() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Sekund logo"
              className="h-10 w-10 rounded-full"
            />
            <span className="font-display text-2xl font-bold tracking-tight">
              Sekund
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Nazad u prodavnicu
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Sekund — Obrenovac
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Kontakt
        </h1>
        <p className="mt-3 max-w-[55ch] text-muted-foreground">
          Svrati u radnju, pozovi ili piši — tu smo za sva pitanja o artiklima
          i porudžbinama.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <MapPin className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display text-lg font-semibold">Adresa</p>
            <p className="mt-1 text-muted-foreground">
              Braće Joksić 197
              <br />
              Obrenovac
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <Phone className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display text-lg font-semibold">Telefon</p>
            <p className="mt-1 text-muted-foreground">069 488 47 39</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <Mail className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display text-lg font-semibold">Mejl</p>
            <p className="mt-1 break-all text-muted-foreground">
              Sekund.hendd@gmail.com
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <Clock className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display text-lg font-semibold">Radno vreme</p>
            <p className="mt-1 text-muted-foreground">
              Ponedeljak – petak: 10:00 – 19:00
              <br />
              Subota: 10:00 – 15:00
              <br />
              Nedelja: neradno
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
