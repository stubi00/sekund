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
import ImagePicker from '@/components/ImagePicker'

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
  onSave: (data: Omit<Product, 'id'>, id?: string) => void
}

export default function ProductForm({
  open,
  onOpenChange,
  editing,
  onSave,
}: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [color, setColor] = useState(PALETTE[0])
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '')
      setPrice(editing ? String(editing.price) : '')
      setCategory(editing?.category ?? '')
      setDescription(editing?.description ?? '')
      setImageUrl(editing?.imageUrl ?? '')
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
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
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
          <div className="space-y-2">
            <Label htmlFor="p-desc">Opis</Label>
            <Textarea
              id="p-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kratak opis stanja i detalja"
            />
          </div>
          <ImagePicker
            id="p-image-file"
            image={imageUrl}
            onChange={setImageUrl}
            label="Slika artikla (slikaj telefonom ili ubaci fajl)"
          />
          <div className="space-y-2">
            <Label htmlFor="p-image">ili URL slike (opciono)</Label>
            <Input
              id="p-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
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
