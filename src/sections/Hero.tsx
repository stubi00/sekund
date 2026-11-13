import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Hero() {
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
          <div className="tag-card w-56 rotate-[-4deg] rounded-lg border border-border bg-card p-5 shadow-lg">
            <div className="mb-3 h-3 w-3 rounded-full border-2 border-primary" />
            <p className="font-display text-lg font-semibold">Denim jakna</p>
            <p className="text-sm text-muted-foreground">Jakne</p>
            <p className="mt-3 font-display text-2xl font-bold text-primary">
              2.400 RSD
            </p>
          </div>
          <div className="tag-card -ml-10 mt-24 w-48 rotate-[5deg] rounded-lg border border-border bg-card p-5 shadow-lg">
            <div className="mb-3 h-3 w-3 rounded-full border-2 border-primary" />
            <p className="font-display text-lg font-semibold">Vuneni kaput</p>
            <p className="text-sm text-muted-foreground">Kaputi</p>
            <p className="mt-3 font-display text-2xl font-bold text-primary">
              4.500 RSD
            </p>
          </div>
          <div className="stamp absolute -top-2 right-2 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-primary text-center font-display text-sm font-bold uppercase leading-tight text-primary md:right-8">
            Polovno
            <br />
            provereno
          </div>
        </div>
      </div>
    </section>
  )
}
