import { useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Notifications() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<'announcement' | 'prayer_topic'>('announcement')
  const [articleId, setArticleId] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: articles } = useQuery({
    queryKey: ['articles-list'],
    queryFn: api.getArticlesList,
  })

  const mutation = useMutation({
    mutationFn: () => api.broadcastNotification(title, body, type, articleId),
    onSuccess: (res) => {
      setResult(`Notification envoyée à ${res.notified} utilisateur(s).`)
      setError(null)
      setTitle('')
      setBody('')
      setArticleId('')
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400">
              Article lié (optionnel — ouvre la notification en mode lecture)
            </label>
            <select
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              className="rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white"
            >
              <option value="" className="bg-gray-900">
                Aucun article — simple annonce
              </option>
              {articles?.map((a) => (
                <option key={a.id} value={a.id} className="bg-gray-900">
                  {a.title}
                </option>
              ))}
            </select>
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
