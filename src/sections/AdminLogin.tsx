import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { login } from '@/lib/api'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function AdminLogin({ open, onOpenChange, onSuccess }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const ok = await login(password)
      if (ok) {
        setPassword('')
        onSuccess()
      } else {
        setError('Pogrešna lozinka. Pokušaj ponovo.')
      }
    } catch {
      setError('Server nije dostupan. Proveri da li je pokrenut.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Admin prijava
          </DialogTitle>
          <DialogDescription>
            Unesi lozinku da bi mogao da dodaješ artikle i menjaš cene.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-pass">Lozinka</Label>
            <Input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Prijavljivanje…' : 'Prijavi se'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
