export default function Footer() {
  return (
    <footer
      id="kontakt"
      className="border-t border-border bg-accent text-accent-foreground"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Sekund logo"
              className="h-9 w-9 rounded-full"
            />
            <p className="font-display text-2xl font-bold">Sekund</p>
          </div>
          <p className="mt-2 max-w-[36ch] text-sm opacity-80">
            Prodavnica polovne garderobe. Sve provereno, sve sa pričom.
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold">Radno vreme</p>
          <p className="text-sm opacity-80">
            Pon – Pet: 10:00 – 19:00
            <br />
            Subota: 10:00 – 15:00
            <br />
            Nedelja: zatvoreno
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold">Kontakt</p>
          <p className="text-sm opacity-80">
            Braće Joksić 197, Obrenovac
            <br />
            <a
              href="tel:+381694884739"
              className="underline underline-offset-4 hover:opacity-100"
            >
              069 488 4739
            </a>
            <br />
            <a
              href="mailto:Sekund.hendd@gmail.com"
              className="underline underline-offset-4 hover:opacity-100"
            >
              Sekund.hendd@gmail.com
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Sekund — sve dobija drugu šansu.
      </div>
    </footer>
  )
}
