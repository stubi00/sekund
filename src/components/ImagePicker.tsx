import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export default function ImagePicker({
  id,
  image,
  onChange,
  label = 'Slika (opciono)',
}: {
  id: string
  image: string
  onChange: (url: string) => void
  label?: string
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErr('')
    setBusy(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.onerror = reject
        r.readAsDataURL(file)
      })
      const { url } = await api.uploadImage(dataUrl)
      onChange(url)
    } catch {
      setErr('Upload nije uspeo (max 6 MB, jpg/png/webp).')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {image ? (
        <div className="relative w-fit">
          <img
            src={image}
            alt="Izabrana slika"
            className="h-20 w-32 rounded-md border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground"
            aria-label="Ukloni sliku"
          >
            ×
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`flex h-20 w-32 cursor-pointer items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary ${busy ? 'pointer-events-none opacity-50' : ''}`}
        >
          {busy ? 'Šaljem…' : '+ Dodaj sliku'}
        </label>
      )}
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={pick}
      />
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  )
}
