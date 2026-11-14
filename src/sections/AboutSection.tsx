interface Props {
  text?: string
}

export default function AboutSection({ text }: Props) {
  if (!text?.trim()) return null
  return (
    <section id="o-nama" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Naša priča
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          O nama
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-foreground/90">
          {text
            .split(/\n\s*\n/)
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      </div>
    </section>
  )
}
