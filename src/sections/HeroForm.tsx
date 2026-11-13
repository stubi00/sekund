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
import ImagePicker from '@/components/ImagePicker'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: SiteSettings
  onSave: (s: SiteSettings) => Promise<void>
}

export default function HeroForm({ open, onOpenChange, settings, onSave }: Props) {
  const [firstName, setFirstName] = useState('')
  const [firstCategory, setFirstCategory] = useState('')
  const [firstPrice, setFirstPrice] = useState('')
  const [secondName, setSecondName] = useState('')
  const [secondCategory, setSecondCategory] = useState('')
  const [secondPrice, setSecondPrice] = useState('')
  const [firstImage, setFirstImage] = useState('')
  const [secondImage, setSecondImage] = useState('')
  const [stamp, setStamp] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      const [a, b] = settings.heroCards
      setFirstName(a?.name ?? '')
      setFirstCategory(a?.category ?? '')
      setFirstPrice(a ? String(a.price) : '')
      setFirstImage(a?.imageUrl ?? '')
      setSecondName(b?.name ?? '')
      setSecondCategory(b?.category ?? '')
      setSecondPrice(b ? String(b.price) : '')
      setSecondImage(b?.imageUrl ?? '')
      setStamp(settings.stamp)
      setError('')
    }
  }, [open, settings])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const p1 = Number(firstPrice)
    const p2 = Number(secondPrice)
    if (!firstName.trim() || !secondName.trim())
      return setError('Nazivi obe kartice su obavezni.')
    if (!(p1 > 0) || !(p2 > 0))
      return setError('Cene moraju biti brojevi veći od nule.')
    if (!stamp.trim()) return setError('Tekst pečata je obavezan.')
    setBusy(true)
    try {
      await onSave({
        heroCards: [
          {
            name: firstName.trim(),
            category: firstCategory.trim(),
            price: Math.round(p1),
            ...(firstImage ? { imageUrl: firstImage } : {}),
          },
          {
            name: secondName.trim(),
            category: secondCategory.trim(),
            price: Math.round(p2),
            ...(secondImage ? { imageUrl: secondImage } : {}),
          },
        ],
        stamp: stamp.trim(),
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
            Kartice pored naslova i tekst pečata.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-semibold">Prva kartica</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="h1-name">Naziv</Label>
                <Input
                  id="h1-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="h1-cat">Kategorija</Label>
                <Input
                  id="h1-cat"
                  value={firstCategory}
                  onChange={(e) => setFirstCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="h1-price">Cena (RSD)</Label>
              <Input
                id="h1-price"
                inputMode="numeric"
                value={firstPrice}
                onChange={(e) => setFirstPrice(e.target.value)}
              />
            </div>
            <ImagePicker id="h1-img" image={firstImage} onChange={setFirstImage} />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-semibold">Druga kartica</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="h2-name">Naziv</Label>
                <Input
                  id="h2-name"
                  value={secondName}
                  onChange={(e) => setSecondName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="h2-cat">Kategorija</Label>
                <Input
                  id="h2-cat"
                  value={secondCategory}
                  onChange={(e) => setSecondCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="h2-price">Cena (RSD)</Label>
              <Input
                id="h2-price"
                inputMode="numeric"
                value={secondPrice}
                onChange={(e) => setSecondPrice(e.target.value)}
              />
            </div>
            <ImagePicker
              id="h2-img"
              image={secondImage}
              onChange={setSecondImage}
            />
          </div>

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
