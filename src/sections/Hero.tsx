import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SiteSettings } from '@/types'
import { formatRsd } from '@/lib/format'

const FALLBACK: SiteSettings = {
  heroCards: [
    { name: 'Denim jakna', category: 'Jakne', price: 2400 },
    { name: 'Vuneni kaput', category: 'Kaputi', price: 4500 },
  ],
  stamp: 'Polovno\nprovereno',
}

interface Props {
  settings?: SiteSettings | null
}

export default function Hero({ settings }: Props) {
  const s = settings ?? FALLBACK
  const [first, second] = s.heroCards
  return (
    <section
      id="pocetna"
      className="relative overflow-hidden border-b border-border"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Prodavnica polovne garderobe
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Sve dobija
            <br />
            drugu šansu.
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
            Svaka stvar kod nas ima svoju priču — pažljivo biramo polovnu
            garderobu koja još ima mnogo toga da ponudi. Oprano, provereno i
            spremno za novog vlasnika. Dođi, pronađi nešto svoje i daj joj
            drugu šansu.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <a href="#katalog">
                Pogledaj ponudu <ArrowDown className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          {first && (
            <div className="tag-card w-56 rotate-[-4deg] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              {first.imageUrl && (
                <img
                  src={first.imageUrl}
                  alt={first.name}
                  className="h-32 w-full object-cover"
                />
              )}
              <div className="p-5">
                {!first.imageUrl && (
                  <div className="mb-3 h-3 w-3 rounded-full border-2 border-primary" />
                )}
                <p className="font-display text-lg font-semibold">
                  {first.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {first.category}
                </p>
                <p className="mt-3 font-display text-2xl font-bold text-primary">
                  {formatRsd(first.price)}
                </p>
              </div>
            </div>
          )}
          {second && (
            <div className="tag-card -ml-10 mt-24 w-48 rotate-[5deg] overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              {second.imageUrl && (
                <img
                  src={second.imageUrl}
                  alt={second.name}
                  className="h-28 w-full object-cover"
                />
              )}
              <div className="p-5">
                {!second.imageUrl && (
                  <div className="mb-3 h-3 w-3 rounded-full border-2 border-primary" />
                )}
                <p className="font-display text-lg font-semibold">
                  {second.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {second.category}
                </p>
                <p className="mt-3 font-display text-2xl font-bold text-primary">
                  {formatRsd(second.price)}
                </p>
              </div>
            </div>
          )}
          <div className="stamp absolute -top-2 right-2 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-primary text-center font-display text-sm font-bold uppercase leading-tight text-primary md:right-8">
            {s.stamp.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
