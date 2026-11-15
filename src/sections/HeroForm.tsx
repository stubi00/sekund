import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { SiteSettings } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: SiteSettings
  onSave: (s: SiteSettings) => Promise<void>
}

export default function HeroForm({ open, onOpenChange, settings, onSave }: Props) {
  const [stamp, setStamp] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [genders, setGenders] = useState<string[]>([])
  const [newGender, setNewGender] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setStamp(settings.stamp)
      setAboutText(settings.aboutText ?? '')
      setGenders(settings.genders?.length ? settings.genders : ['Muško', 'Žensko'])
      setNewGender('')
      setError('')
    }
  }, [open, settings])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stamp.trim()) return setError('Tekst pečata je obavezan.')
    setBusy(true)
    try {
      await onSave({
        ...(settings.heroCards ? { heroCards: settings.heroCards } : {}),
        stamp: stamp.trim(),
        aboutText: aboutText.trim(),
        genders,
      })
      onOpenChange(false)
    } catch {
      setError('Čuvanje nije uspelo — proveri vezu pa pokušaj ponovo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Uredi početnu stranu
          </DialogTitle>
          <DialogDescription>
            Pečat, tekst „O nama" i odeljenja prodavnice.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="h-stamp">
              Tekst pečata (svaki red je poseban red u pečatu)
            </Label>
            <Textarea
              id="h-stamp"
              rows={2}
              value={stamp}
              onChange={(e) => setStamp(e.target.value)}
              placeholder="Polovno&#10;provereno"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="h-about">
              Tekst za stranicu „O nama" (prazan red = novi pasus)
            </Label>
            <Textarea
              id="h-about"
              rows={6}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Upiši priču svoje radnje…"
            />
          </div>

          <div className="space-y-2">
            <Label>Odeljenja (npr. Muško, Žensko, Dečije)</Label>
            <p className="text-xs text-muted-foreground">
              Klikni u polje da preimenuješ, × da obrišeš.
            </p>
            <div className="space-y-2">
              {genders.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={g}
                    onChange={(e) =>
                      setGenders(
                        genders.map((x, j) => (j === i ? e.target.value : x)),
                      )
                    }
                    aria-label={`Odeljenje ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setGenders(genders.filter((_, j) => j !== i))}
                    aria-label={`Obriši ${g}`}
                    disabled={genders.length <= 1}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
                placeholder="Novo odeljenje…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const v = newGender.trim()
                    if (v && !genders.includes(v) && genders.length < 8) {
                      setGenders([...genders, v])
                      setNewGender('')
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  const v = newGender.trim()
                  if (v && !genders.includes(v) && genders.length < 8) {
                    setGenders([...genders, v])
                    setNewGender('')
                  }
                }}
              >
                + Dodaj
              </Button>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Čuvam…' : 'Sačuvaj izmene'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
