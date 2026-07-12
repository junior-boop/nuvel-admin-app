import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Notifications() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<'announcement' | 'prayer_topic'>('announcement')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => api.broadcastNotification(title, body, type),
    onSuccess: (res) => {
      setResult(`Notification envoyée à ${res.notified} utilisateur(s).`)
      setError(null)
      setTitle('')
      setBody('')
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Échec de l'envoi")
      setResult(null)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setResult(null)
    setError(null)
    mutation.mutate()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Diffuser une notification</h1>
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(['announcement', 'prayer_topic'] as const).map((t) => (
              <Button
                key={t}
                type="button"
                variant={type === t ? 'primary' : 'secondary'}
                onClick={() => setType(t)}
                className="px-3 py-1.5 text-xs"
              >
                {t === 'announcement' ? 'Annonce' : 'Sujet de prière'}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400">Titre</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400">Message</label>
            <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          {result && <p className="text-sm text-emerald-400">{result}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Envoi…' : 'Envoyer à tous les utilisateurs'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
