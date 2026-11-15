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
} from '@/components/ui/dialog'
import type { Product } from '@/types'
import { api } from '@/lib/api'
import { shrinkImage } from '@/lib/image'

const MAX_IMAGES = 6

function MultiImagePicker({
  images,
  onChange,
}: {
  images: string[]
  onChange: (imgs: string[]) => void
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(
      0,
      MAX_IMAGES - images.length,
    )
    if (!files.length) return
    setErr('')
    setBusy(true)
    try {
      const urls: string[] = []
      for (const f of files) {
        const dataUrl = await shrinkImage(f)
        const { url } = await api.uploadImage(dataUrl)
        urls.push(url)
      }
      onChange([...images, ...urls])
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg === 'decode' || msg === 'canvas') {
        setErr(
          'Ova slika se ne može obraditi (telefoni često prave HEIC format) — otvori sliku na telefonu, napravi screenshot i ubaci screenshot.',
        )
      } else if (msg.includes('Neovlašćen')) {
        setErr(
          'Admin sesija je istekla — zatvori ovaj prozor, prijavi se ponovo kao admin, pa ubaci sliku.',
        )
      } else if (msg) {
        setErr(`Upload nije uspeo: ${msg}`)
      } else {
        setErr('Upload nije uspeo — proveri vezu i probaj ponovo.')
      }
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label>
        Slike artikla (do {MAX_IMAGES}) — prva slika je glavna
      </Label>
      <div className="flex flex-wrap gap-2">
        {images.map((u, i) => (
          <div key={u + i} className="relative">
            <img
              src={u}
              alt={`Slika ${i + 1}`}
              className="h-20 w-20 rounded-md border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground"
              aria-label={`Ukloni sliku ${i + 1}`}
            >
              ×
            </button>
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 rounded-b-md bg-primary/90 py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
                GLAVNA
              </span>
            )}
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label
            className={`flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary ${busy ? 'pointer-events-none opacity-50' : ''}`}
          >
            {busy ? 'Šaljem…' : '+ Slika'}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={pick}
            />
          </label>
        )}
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  )
}

const PALETTE = [
  '#8a5a3b',
  '#c1502e',
  '#22302a',
  '#4a6b5d',
  '#a8823f',
  '#3c4a56',
  '#7a4a56',
  '#5d6b3f',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Product | null
  genders?: string[]
  onSave: (data: Omit<Product, 'id'>, id?: string) => void
}

export default function ProductForm({
  open,
  onOpenChange,
  editing,
  genders = [],
  onSave,
}: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [gender, setGender] = useState('')
  const [size, setSize] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [color, setColor] = useState(PALETTE[0])
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setPrice(editing ? String(editing.price) : '')
      setCategory(editing?.category ?? '')
      setGender(editing?.gender ?? '')
      setSize(editing?.size ?? '')
      setDescription(editing?.description ?? '')
      setImages(
        editing?.images?.length
          ? editing.images
          : editing?.imageUrl
            ? [editing.imageUrl]
            : [],
      )
      setColor(editing?.color ?? PALETTE[0])
      setError('')
    }
  }, [open, editing])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const priceNum = Number(price.replace(/\./g, '').replace(',', '.'))
    if (!name.trim()) return setError('Naziv je obavezan.')
    if (!category.trim()) return setError('Kategorija je obavezna.')
    if (!Number.isFinite(priceNum) || priceNum <= 0)
      return setError('Cena mora biti broj veći od nule.')
    onSave(
      {
        name: name.trim(),
        price: Math.round(priceNum),
        category: category.trim(),
        gender: gender.trim(),
        size: size.trim(),
        description: description.trim(),
        images,
        color,
      },
      editing?.id,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? 'Izmeni artikal' : 'Novi artikal'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Naziv *</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="npr. Retro stona lampa"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-price">Cena (RSD) *</Label>
              <Input
                id="p-price"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="npr. 2200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-category">Kategorija *</Label>
              <Input
                id="p-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="npr. Dom"
              />
            </div>
          </div>
          {genders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="p-gender">Odeljenje</Label>
              <select
                id="p-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— bez odeljenja —</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="p-size">Veličina</Label>
            <Input
              id="p-size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="npr. M, L, 42, W30 L32"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Opis</Label>
            <Textarea
              id="p-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kratak opis stanja i detalja"
            />
          </div>
          <MultiImagePicker images={images} onChange={setImages} />
          <div className="space-y-2">
            <Label>Boja kartice</Label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Boja ${c}`}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    color === c
                      ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full">
            {editing ? 'Sačuvaj izmene' : 'Dodaj artikal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
