import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

// Smanji sliku pre uploada: max 1600px, JPEG ~0.85 kvalitet.
// Telefonske fotke od 10+ MB padnu na par stotina KB.
const MAX_DIM = 1600
const QUALITY = 0.85

function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      let { width, height } = img
      if (width <= MAX_DIM && height <= MAX_DIM && file.size < 900 * 1024) {
        // dovoljno mala — šalji original
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.onerror = reject
        r.readAsDataURL(file)
        return
      }
      const scale = Math.min(1, MAX_DIM / width, MAX_DIM / height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', QUALITY))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

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
      const dataUrl = await shrinkImage(file)
      const { url } = await api.uploadImage(dataUrl)
      onChange(url)
    } catch {
      setErr('Upload nije uspeo — probaj drugu sliku.')
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
